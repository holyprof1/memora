import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";

export async function generateShirtId() {
  const counter = await prisma.counter.upsert({
    where: { key: "shirt" },
    create: { key: "shirt", value: 1 },
    update: { value: { increment: 1 } },
  });
  return String(counter.value).padStart(3, "0");
}

export function getAppUrl() {
  const value = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (!value) throw new Error("NEXT_PUBLIC_APP_URL is not configured");
  return value;
}

export async function buildQrSvg(pageUrl: string) {
  return QRCode.toString(pageUrl, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    width: 640,
    color: { dark: "#261812", light: "#FFFFFF" },
  });
}
