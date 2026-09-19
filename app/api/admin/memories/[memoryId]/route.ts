import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ memoryId: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { memoryId } = await params;
  const id = Number(memoryId);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Invalid memory" }, { status: 400 });

  const existing = await prisma.memory.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Memory not found" }, { status: 404 });

  await prisma.memory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
