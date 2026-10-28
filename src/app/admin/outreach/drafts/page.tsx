"use client";

import { useEffect, useState } from "react";

type Draft = {
  id: string;
  toEmail: string;
  subject: string;
  body: string;
  note: string;
  organization: { name: string; city: string; country: string };
};

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    fetch("/api/admin/outreach/drafts")
      .then((res) => res.json())
      .then((data) => setDrafts(data.drafts || []));
  }

  useEffect(() => {
    load();
  }, []);

  async function save(draft: Draft) {
    await fetch(`/api/admin/outreach/drafts/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: draft.subject, body: draft.body }),
    });
  }

  async function approve(ids: string[], all = false) {
    setBusy(true);
    setNotice(null);
    for (const draft of drafts.filter((item) => all || ids.includes(item.id))) {
      await save(draft);
    }
    const res = await fetch("/api/admin/outreach/drafts/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(all ? { all: true } : { ids }),
    });
    const data = await res.json();
    setNotice(
      res.ok
        ? `Sent ${data.sent || 0}.${data.failed?.length ? ` ${data.failed.join(" ")}` : ""}`
        : data.error || "Could not send."
    );
    setBusy(false);
    load();
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-[28px] font-semibold tracking-tight text-ink">Drafts</h2>
        {drafts.length > 0 && (
          <button className="btn" disabled={busy} onClick={() => approve([], true)}>
            Approve all
          </button>
        )}
      </div>
      {notice && <p className="mt-4 text-[15px] text-muted">{notice}</p>}
      <div className="mt-6 space-y-4">
        {drafts.length === 0 && <p className="text-[15px] text-muted">No drafts waiting.</p>}
        {drafts.map((draft) => (
          <article key={draft.id} className="rounded-3xl bg-canvas p-5">
            <p className="text-[13px] text-muted">
              {draft.organization.name} · {draft.organization.city}, {draft.organization.country}
            </p>
            <p className="mt-1 text-[13px] text-muted">To {draft.toEmail}</p>
            <input
              className="field mt-3"
              value={draft.subject}
              onChange={(event) =>
                setDrafts((current) =>
                  current.map((item) => (item.id === draft.id ? { ...item, subject: event.target.value } : item))
                )
              }
            />
            <textarea
              className="field mt-3"
              rows={8}
              value={draft.body}
              onChange={(event) =>
                setDrafts((current) =>
                  current.map((item) => (item.id === draft.id ? { ...item, body: event.target.value } : item))
                )
              }
            />
            <p className="mt-2 text-[13px] text-muted">Note: {draft.note}</p>
            <button className="btn mt-4" disabled={busy} onClick={() => approve([draft.id])}>
              Approve
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
