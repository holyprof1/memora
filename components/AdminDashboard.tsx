"use client";

import { useEffect, useState } from "react";

type Shirt = {
  id: number;
  shirtId: string;
  displayName: string | null;
  department: string | null;
  pageUrl: string;
  createdAt: string;
  _count: { memories: number };
};

type Memory = {
  id: number;
  visitorName: string;
  visitorDepartment: string | null;
  memory: string;
  createdAt: string;
};

function date(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function AdminDashboard({ email }: { email: string }) {
  const [shirts, setShirts] = useState<Shirt[]>([]);
  const [shirtTotal, setShirtTotal] = useState(0);
  const [memoryTotal, setMemoryTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [savingShirt, setSavingShirt] = useState(false);
  const [openMemories, setOpenMemories] = useState<string | null>(null);
  const [memories, setMemories] = useState<Record<string, Memory[]>>({});
  const [editing, setEditing] = useState<string | null>(null);

  async function load(pageValue = page, searchValue = search) {
    setLoading(true);
    try {
      const [shirtsResponse, statsResponse] = await Promise.all([
        fetch(`/api/admin/shirts?page=${pageValue}&pageSize=24&q=${encodeURIComponent(searchValue)}`, { cache: "no-store" }),
        fetch("/api/admin/stats", { cache: "no-store" }),
      ]);
      if (shirtsResponse.status === 401 || statsResponse.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const shirtData = await shirtsResponse.json();
      const statsData = await statsResponse.json();
      setShirts(shirtData.items ?? []);
      setShirtTotal(shirtData.total ?? 0);
      setTotalPages(shirtData.totalPages ?? 1);
      setMemoryTotal(statsData.memories ?? 0);
    } catch {
      setNotice("Could not load the dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(1, ""); }, []);

  async function createShirt() {
    setSavingShirt(true);
    setNotice("");
    try {
      const response = await fetch("/api/admin/shirts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: newDisplayName, department: newDepartment }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to create shirt");
      setNewDisplayName("");
      setNewDepartment("");
      setPage(1);
      await load(1, search);
      setNotice(`Shirt ${data.shirtId} created. Its QR is ready to print.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to create shirt");
    } finally {
      setSavingShirt(false);
    }
  }

  async function updateShirt(shirtId: string, displayName: string, department: string) {
    const response = await fetch(`/api/admin/shirts/${shirtId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, department }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Unable to update shirt");
    setEditing(null);
    await load(page, search);
    setNotice(`Shirt ${shirtId} updated. Its QR URL stayed the same.`);
  }

  async function showMemories(shirtId: string) {
    if (openMemories === shirtId) {
      setOpenMemories(null);
      return;
    }
    setOpenMemories(shirtId);
    if (memories[shirtId]) return;
    const response = await fetch(`/api/admin/shirts/${shirtId}/memories?page=1&pageSize=25`, { cache: "no-store" });
    const data = await response.json();
    setMemories((current) => ({ ...current, [shirtId]: data.items ?? [] }));
  }

  async function deleteMemory(memoryId: number, shirtId: string) {
    if (!window.confirm("Delete this memory?")) return;
    const response = await fetch(`/api/admin/memories/${memoryId}`, { method: "DELETE" });
    if (!response.ok) {
      setNotice("Could not delete that memory.");
      return;
    }
    setMemories((current) => ({ ...current, [shirtId]: (current[shirtId] ?? []).filter((memory) => memory.id !== memoryId) }));
    await load(page, search);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  function runSearch() {
    setPage(1);
    void load(1, search);
  }

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <div className="admin-top">
          <a href="/" className="brand"><span className="brand-dot" /> MEMORA</a>
          <div className="right">
            <span className="subtle" style={{ fontSize: 13 }}>{email}</span>
            <button className="ghost-btn" onClick={logout}>Sign out</button>
          </div>
        </div>

        <div className="admin-heading">
          <div className="eyebrow">Private admin</div>
          <h1>Your MEMORA collection</h1>
        </div>

        <div className="admin-grid">
          <div className="stat"><div className="n">{shirtTotal}</div><div className="t">Shirts</div></div>
          <div className="stat"><div className="n">{memoryTotal}</div><div className="t">Memories</div></div>
          <div className="stat"><div className="n">/{shirts[0]?.shirtId ?? "001"}</div><div className="t">Dynamic QR pages</div></div>
        </div>

        <section className="panel">
          <h2>Add a shirt</h2>
          <div className="add-grid">
            <div><label className="label" htmlFor="newName">Display name <span className="optional">Optional</span></label><input className="input" id="newName" value={newDisplayName} onChange={(e) => setNewDisplayName(e.target.value)} placeholder="David" maxLength={80} /></div>
            <div><label className="label" htmlFor="newDept">Department <span className="optional">Optional</span></label><input className="input" id="newDept" value={newDepartment} onChange={(e) => setNewDepartment(e.target.value)} placeholder="Computer Science" maxLength={100} /></div>
            <button className="primary-btn" style={{ width: "auto", padding: "0 20px", marginTop: 0 }} onClick={createShirt} disabled={savingShirt}>{savingShirt ? "Creating…" : "Add Shirt"}</button>
          </div>
          {notice ? <div className="error" style={{ background: "var(--soft)", color: "var(--ink)" }}>{notice}</div> : null}
        </section>

        <section className="panel">
          <h2>Shirts</h2>
          <div className="search-row">
            <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }} placeholder="Search shirt ID, name or department" />
            <button className="ghost-btn" onClick={runSearch}>Search</button>
          </div>

          {loading ? <div className="empty">Loading shirts…</div> : shirts.length === 0 ? <div className="empty">No shirts found.</div> : (
            <div className="shirts">
              {shirts.map((shirt) => (
                <ShirtCard
                  key={shirt.shirtId}
                  shirt={shirt}
                  editing={editing === shirt.shirtId}
                  memories={memories[shirt.shirtId]}
                  memoriesOpen={openMemories === shirt.shirtId}
                  onEdit={() => setEditing(editing === shirt.shirtId ? null : shirt.shirtId)}
                  onSave={updateShirt}
                  onMemories={() => void showMemories(shirt.shirtId)}
                  onDeleteMemory={(id) => void deleteMemory(id, shirt.shirtId)}
                />
              ))}
            </div>
          )}

          <div className="pagination">
            <button className="ghost-btn" disabled={page <= 1 || loading} onClick={() => { const next = page - 1; setPage(next); void load(next, search); }}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button className="ghost-btn" disabled={page >= totalPages || loading} onClick={() => { const next = page + 1; setPage(next); void load(next, search); }}>Next</button>
          </div>
        </section>
      </div>
    </main>
  );
}

function ShirtCard({ shirt, editing, memories, memoriesOpen, onEdit, onSave, onMemories, onDeleteMemory }: {
  shirt: Shirt;
  editing: boolean;
  memories?: Memory[];
  memoriesOpen: boolean;
  onEdit: () => void;
  onSave: (shirtId: string, displayName: string, department: string) => Promise<void>;
  onMemories: () => void;
  onDeleteMemory: (id: number) => void;
}) {
  const [displayName, setDisplayName] = useState(shirt.displayName ?? "");
  const [department, setDepartment] = useState(shirt.department ?? "");
  const [saving, setSaving] = useState(false);

  return (
    <article className="shirt-card">
      <div className="shirt-card-top">
        <div>
          <div className="shirt-id">Shirt {shirt.shirtId}</div>
          <div className="shirt-name">{shirt.displayName || "No display name"}{shirt.department ? ` · ${shirt.department}` : ""}</div>
        </div>
        <span className="optional">{shirt._count.memories} memories</span>
      </div>

      <div className="qr-box"><img src={`/api/admin/shirts/${shirt.shirtId}/qr`} alt={`QR code for Shirt ${shirt.shirtId}`} /></div>

      <div className="card-actions">
        <a className="small-btn" href={`/api/admin/shirts/${shirt.shirtId}/qr?download=1`}>Download QR</a>
        <a className="small-btn" href={shirt.pageUrl} target="_blank" rel="noreferrer">Open Page</a>
        <button className="small-btn" onClick={onMemories}>Memories</button>
        <button className="small-btn" onClick={onEdit}>{editing ? "Close Edit" : "Edit"}</button>
      </div>

      {editing ? (
        <div className="edit-form">
          <input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name" maxLength={80} />
          <input className="input" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department" maxLength={100} />
          <div className="edit-actions"><button className="small-btn" disabled={saving} onClick={async () => { setSaving(true); try { await onSave(shirt.shirtId, displayName, department); } finally { setSaving(false); } }}>{saving ? "Saving…" : "Save"}</button></div>
        </div>
      ) : null}

      {memoriesOpen ? (
        <div className="memories">
          {!memories ? <div className="empty" style={{ padding: "20px 0" }}>Loading memories…</div> : memories.length === 0 ? <div className="empty" style={{ padding: "20px 0" }}>No memories yet.</div> : memories.map((memory) => (
            <div className="memory-item" key={memory.id}>
              <div className="memory-meta"><span className="memory-author">{memory.visitorName}{memory.visitorDepartment ? ` · ${memory.visitorDepartment}` : ""}</span><span>{date(memory.createdAt)}</span></div>
              <div className="memory-text">{memory.memory}</div>
              <div style={{ marginTop: 8 }}><button className="danger-btn small-btn" onClick={() => onDeleteMemory(memory.id)}>Delete</button></div>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
