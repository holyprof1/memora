"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function OwnerLoginForm() {
  const router = useRouter(); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(""); const form = new FormData(event.currentTarget); const response = await fetch("/api/owner/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) }); const data = await response.json(); if (!response.ok) { setError(data.error ?? "Could not sign in"); setBusy(false); return; } router.replace("/my-memories"); router.refresh(); }
  return <form className="memory-form" onSubmit={submit}><div className="field"><label className="label" htmlFor="email">Email</label><input className="input" id="email" name="email" type="email" autoComplete="email" required /></div><div className="field"><label className="label" htmlFor="password">Password</label><input className="input" id="password" name="password" type="password" autoComplete="current-password" required /></div>{error ? <div className="error">{error}</div> : null}<button className="primary-btn" disabled={busy}>{busy ? "Signing in…" : "View my memories"}</button></form>;
}
