import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MemoryForm } from "@/components/MemoryForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function MemoryPage({ params }: { params: Promise<{ shirtId: string }> }) {
  const { shirtId } = await params;
  const shirt = await prisma.shirt.findUnique({
    where: { shirtId },
    select: { shirtId: true, displayName: true },
  });

  if (!shirt) notFound();

  return (
    <main className="memora-shell">
      <a href="/" className="brand"><span className="brand-dot" /> MEMORA</a>
      <section className="memory-card">
        <div className="eyebrow">Shirt {shirt.shirtId}</div>
        <h1 className="display-title">{shirt.displayName ? <>Leave a memory for {shirt.displayName} ❤️</> : <>Leave a memory ❤️</>}</h1>
        <p className="subtle" style={{ lineHeight: 1.55, margin: 0 }}>No account. No login. Just leave something worth remembering.</p>
        <MemoryForm shirtId={shirt.shirtId} />
      </section>
    </main>
  );
}
