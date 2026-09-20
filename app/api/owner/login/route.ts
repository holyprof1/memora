import { NextResponse } from "next/server";
import { createOwnerSession, verifyStoredPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ownerLoginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = ownerLoginSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check your details" }, { status: 400 });
  const owner = await prisma.owner.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!owner || !verifyStoredPassword(parsed.data.password, owner.passwordHash)) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  await createOwnerSession(owner.id);
  return NextResponse.json({ ok: true });
}
