import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-shell">
      <a href="/" className="brand"><span className="brand-dot" /> MEMORA</a>
      <section className="hero">
        <div>
          <div className="eyebrow">A little guestbook, carried with you</div>
          <h1>Keep the moments that belong to each shirt.</h1>
          <p>Every shirt gets one permanent QR identity. Scan it, leave a memory, and MEMORA keeps the message attached to that exact shirt.</p>
        </div>
        <div className="hero-card">
          <div className="fake-qr" aria-hidden="true">⌗</div>
          <p className="subtle" style={{ margin: "18px 0 0", lineHeight: 1.5 }}>The real experience lives at a QR page such as <strong>/m/027</strong>.</p>
          <Link href="/admin/login" className="small-btn" style={{ display: "inline-block", marginTop: 14, textDecoration: "none" }}>Admin</Link>
        </div>
      </section>
    </main>
  );
}
