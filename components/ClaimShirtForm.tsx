"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function ClaimShirtForm({ shirtId }: { shirtId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/claim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      shirtId, displayName: form.get("displayName"), department: form.get("department"), email: form.get("email"), phone: form.get("phone"), password: form.get("password"),
    }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error ?? "We couldn't claim this shirt"); setBusy(false); return; }
    router.replace(`/me/${shirtId}`); router.refresh();
  }

  return <form className="memory-form" onSubmit={submit}>
    <div className="field"><label className="label" htmlFor="displayName">Your name</label><input className="input" id="displayName" name="displayName" maxLength={80} autoComplete="name" required /></div>
    <div className="field"><label className="label" htmlFor="department">Department <span className="optional">Optional</span></label><input className="input" id="department" name="department" maxLength={100} /></div>
    <div className="field"><label className="label" htmlFor="email">Email address</label><input className="input" id="email" name="email" type="email" autoComplete="email" required /></div>
    <div className="field"><label className="label" htmlFor="phone">Phone number <span className="optional">Optional</span></label><input className="input" id="phone" name="phone" type="tel" autoComplete="tel" /></div>
    <div className="field"><label className="label" htmlFor="password">Create a password</label><input className="input" id="password" name="password" type="password" minLength={6} autoComplete="new-password" required /><div className="optional" style={{ marginTop: 6 }}>Use this to see your memories without the shirt.</div></div>
    {error ? <div className="error" role="alert">{error}</div> : null}
    <button className="primary-btn" type="submit" disabled={busy}>{busy ? "Claiming…" : "Claim this shirt"}</button>
  </form>;
}
