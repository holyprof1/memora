import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateShirtSchema } from "@/lib/validation";

type Params = { params: Promise<{ shirtId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { shirtId } = await params;
    const shirt = await prisma.shirt.findUnique({
      where: { shirtId },
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
    if (!shirt) return NextResponse.json({ error: "Shirt not found" }, { status: 404 });
    return NextResponse.json(shirt);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { shirtId } = await params;
    const parsed = updateShirtSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Please check the shirt details" }, { status: 400 });

    const shirt = await prisma.shirt.update({
      where: { shirtId },
      data: {
        displayName: parsed.data.displayName || null,
        department: parsed.data.department || null,
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
    return NextResponse.json(shirt);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to update does not exist")) {
      return NextResponse.json({ error: "Shirt not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Unable to update shirt" }, { status: 500 });
  }
}
