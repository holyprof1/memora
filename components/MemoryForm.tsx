"use client";

import { FormEvent, useState } from "react";

export function MemoryForm({ shirtId }: { shirtId: string }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = {
      shirtId,
      visitorName: String(form.get("visitorName") ?? ""),
      visitorDepartment: String(form.get("visitorDepartment") ?? ""),
      memory: String(form.get("memory") ?? ""),
      website: String(form.get("website") ?? ""),
    };

    try {
      const response = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't save your memory");
      setSaved(true);
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't save your memory");
    } finally {
      setBusy(false);
    }
  }

  if (saved) {
    return (
      <div className="saved" role="status" aria-live="polite">
        <div className="saved-icon">❤️</div>
        <h2>Memory saved ❤️</h2>
        <p>Thanks for leaving something worth remembering.</p>
      </div>
    );
  }

  return (
    <form className="memory-form" onSubmit={submit}>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, opacity: 0 }} />
      <div className="field">
        <label className="label" htmlFor="visitorName">Your name / nickname</label>
        <input className="input" id="visitorName" name="visitorName" maxLength={80} required autoComplete="name" />
      </div>

      <div className="field">
        <label className="label" htmlFor="visitorDepartment">
          Department <span className="optional">Optional</span>
        </label>
        <input className="input" id="visitorDepartment" name="visitorDepartment" maxLength={100} />
      </div>

      <div className="field">
        <label className="label" htmlFor="memory">Your memory</label>
        <textarea className="textarea" id="memory" name="memory" maxLength={5000} required placeholder="Write something you’ll want to remember…" />
      </div>

      {error ? <div className="error" role="alert">{error}</div> : null}
      <button className="primary-btn" type="submit" disabled={busy}>
        {busy ? "Saving…" : "Leave Memory"}
      </button>
    </form>
  );
}
