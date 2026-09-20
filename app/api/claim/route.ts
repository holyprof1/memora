import { NextResponse } from "next/server";
import { hashPassword, createOwnerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { claimShirtSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = claimShirtSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check your details" }, { status: 400 });
  const data = parsed.data;
  try {
    const owner = await prisma.$transaction(async (tx) => {
      const shirt = await tx.shirt.findUnique({ where: { shirtId: data.shirtId }, select: { ownerId: true } });
      if (!shirt) throw new Error("NOT_FOUND");
      if (shirt.ownerId) throw new Error("CLAIMED");
      const existing = await tx.owner.findUnique({ where: { email: data.email.toLowerCase() } });
      if (existing) throw new Error("EMAIL_EXISTS");
      const created = await tx.owner.create({ data: { displayName: data.displayName, department: data.department || null, email: data.email.toLowerCase(), phone: data.phone || null, passwordHash: hashPassword(data.password) } });
      const claimed = await tx.shirt.updateMany({ where: { shirtId: data.shirtId, ownerId: null }, data: { ownerId: created.id, displayName: data.displayName, department: data.department || null } });
      if (!claimed.count) throw new Error("CLAIMED");
      return created;
    });
    await createOwnerSession(owner.id);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const errors: Record<string, string> = { NOT_FOUND: "This shirt does not exist", CLAIMED: "This shirt has already been claimed", EMAIL_EXISTS: "An account already uses this email. Sign in to see your memories." };
    return NextResponse.json({ error: errors[message] ?? "We couldn't claim this shirt" }, { status: 409 });
  }
}
