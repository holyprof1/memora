import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-shell">
      <a href="/" className="brand"><span className="brand-dot" /> MEMORA</a>
      <section className="hero">
        <div>
          <div className="eyebrow">A little guestbook, carried with you</div>
          <h1>Keep the moments that belong to each shirt.</h1>
          <p>Claim your shirt once, then let the people around you leave memories that stay with you.</p>
        </div>
        <div className="hero-card">
          <div className="fake-qr" aria-hidden="true">⌗</div>
          <p className="subtle" style={{ margin: "18px 0 0", lineHeight: 1.5 }}>Scan your shirt QR to claim it, or sign in whenever you want to revisit your memories.</p>
          <Link href="/login" className="small-btn" style={{ display: "inline-block", marginTop: 14, textDecoration: "none" }}>My memories</Link>
        </div>
      </section>
    </main>
  );
}
