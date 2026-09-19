import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createMemorySchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const parsed = createMemorySchema.safeParse(await request.json());
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Please check your entry";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (parsed.data.website) return NextResponse.json({ ok: true }, { status: 201 });

    const shirt = await prisma.shirt.findUnique({ where: { shirtId: parsed.data.shirtId }, select: { shirtId: true } });
    if (!shirt) return NextResponse.json({ error: "This MEMORA page does not exist" }, { status: 404 });

    await prisma.memory.create({
      data: {
        shirtId: parsed.data.shirtId,
        visitorName: parsed.data.visitorName,
        visitorDepartment: parsed.data.visitorDepartment || null,
        memory: parsed.data.memory,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "We couldn't save your memory" }, { status: 500 });
  }
}
