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

export default function DraftQueue({ mode }: { mode: "drafts" | "outbox" }) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const outbox = mode === "outbox";

  function load() {
    const url = outbox ? "/api/admin/outreach/drafts?status=OUTBOX" : "/api/admin/outreach/drafts";
    fetch(url)
      .then((res) => res.json())
      .then((data) => setDrafts(data.drafts || []));
  }

  useEffect(() => {
    load();
  }, [outbox]);

  async function save(draft: Draft) {
    await fetch(`/api/admin/outreach/drafts/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: draft.subject, body: draft.body }),
    });
  }

  async function run(ids: string[], all = false) {
    setBusy(true);
    setNotice(null);
    for (const draft of drafts.filter((item) => all || ids.includes(item.id))) {
      await save(draft);
    }
    const res = await fetch(outbox ? "/api/admin/outreach/drafts/send" : "/api/admin/outreach/drafts/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(all ? { all: true } : { ids }),
    });
    const data = await res.json();
    if (!res.ok) {
      setNotice(data.error || (outbox ? "Could not send." : "Could not approve."));
    } else if (outbox) {
      setNotice(`Sent ${data.sent || 0}.${data.failed?.length ? ` ${data.failed.join(" ")}` : ""}`);
    } else {
      setNotice(`Moved ${data.moved || 0} to the outbox.`);
    }
    setBusy(false);
    load();
  }

  async function remove(draft: Draft) {
    setBusy(true);
    setNotice(null);
    const res = await fetch(`/api/admin/outreach/drafts/${draft.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setNotice(res.ok ? "Deleted." : data.error || "Could not delete.");
    setBusy(false);
    load();
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-semibold tracking-tight text-ink">{outbox ? "Outbox" : "Drafts"}</h2>
          <p className="mt-2 text-[15px] text-muted">
            {outbox
              ? "Approved messages wait here. Send one, edit it, or delete it."
              : "Approve a draft to move it to the outbox. Deleting it discards it without sending."}
          </p>
        </div>
        {drafts.length > 0 && (
          <button className="btn" disabled={busy} onClick={() => run([], true)}>
            {outbox ? "Send all" : "Approve all"}
          </button>
        )}
      </div>
      {notice && <p className="mt-4 text-[15px] text-muted">{notice}</p>}
      <div className="mt-6 space-y-4">
        {drafts.length === 0 && <p className="text-[15px] text-muted">{outbox ? "The outbox is empty." : "No drafts waiting."}</p>}
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
            <div className="mt-4 flex gap-3">
              <button className="btn" disabled={busy} onClick={() => run([draft.id])}>
                {outbox ? "Send" : "Approve"}
              </button>
              <button className="btn" disabled={busy} onClick={() => remove(draft)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
