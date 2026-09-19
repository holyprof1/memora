import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
    const [shirts, memories] = await Promise.all([
      prisma.shirt.count(),
      prisma.memory.count(),
    ]);
    return NextResponse.json({ shirts, memories });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
