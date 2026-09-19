import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildQrSvg, generateShirtId, getAppUrl } from "@/lib/shirts";
import { createShirtSchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.trim() ?? "";
    const page = Math.max(Number(url.searchParams.get("page") ?? "1") || 1, 1);
    const pageSize = Math.min(Math.max(Number(url.searchParams.get("pageSize") ?? "24") || 24, 1), 50);

    const where = q
      ? {
          OR: [
            { shirtId: { contains: q } },
            { displayName: { contains: q } },
            { department: { contains: q } },
          ],
        }
      : undefined;

    const [items, total] = await Promise.all([
      prisma.shirt.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          shirtId: true,
          displayName: true,
          department: true,
          pageUrl: true,
          createdAt: true,
          _count: { select: { memories: true } },
        },
      }),
      prisma.shirt.count({ where }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = createShirtSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the shirt details" }, { status: 400 });
    }

    const shirtId = await generateShirtId();
    const pageUrl = `${getAppUrl()}/m/${shirtId}`;
    const qrCodeSvg = await buildQrSvg(pageUrl);

    const shirt = await prisma.shirt.create({
      data: {
        shirtId,
        displayName: parsed.data.displayName || null,
        department: parsed.data.department || null,
        pageUrl,
        qrCodeSvg,
      },
      select: {
        id: true,
        shirtId: true,
        displayName: true,
        department: true,
        pageUrl: true,
        createdAt: true,
        _count: { select: { memories: true } },
      },
    });

    return NextResponse.json(shirt, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to create shirt" }, { status: 500 });
  }
}
