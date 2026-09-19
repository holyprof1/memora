import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ shirtId: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { shirtId } = await params;
    const url = new URL(request.url);
    const page = Math.max(Number(url.searchParams.get("page") ?? "1") || 1, 1);
    const pageSize = Math.min(Math.max(Number(url.searchParams.get("pageSize") ?? "25") || 25, 1), 50);

    const [items, total] = await Promise.all([
      prisma.memory.findMany({
        where: { shirtId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          visitorName: true,
          visitorDepartment: true,
          memory: true,
          createdAt: true,
        },
      }),
      prisma.memory.count({ where: { shirtId } }),
    ]);

    return NextResponse.json({ items, total, page, pageSize, totalPages: Math.max(Math.ceil(total / pageSize), 1) });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
