import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ shirtId: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { shirtId } = await params;
    const shirt = await prisma.shirt.findUnique({ where: { shirtId }, select: { qrCodeSvg: true } });
    if (!shirt) return new NextResponse("Not found", { status: 404 });

    const download = new URL(request.url).searchParams.get("download") === "1";
    return new NextResponse(shirt.qrCodeSvg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "private, max-age=3600",
        ...(download ? { "Content-Disposition": `attachment; filename=memora-${shirtId}.svg` } : {}),
      },
    });
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}
