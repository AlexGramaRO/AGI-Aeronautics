"use client";

import { useEffect, useState } from "react";

type Message = {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  fromEmail: string;
  toEmail: string;
  subject: string;
  body: string;
  unread: boolean;
  occurredAt: string;
  organization?: { name: string; city: string; country: string } | null;
};

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    fetch("/api/admin/outreach/inbox")
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []));
  }

  useEffect(() => {
    load();
  }, []);

  async function sync() {
    setBusy(true);
    const res = await fetch("/api/admin/outreach/inbox", { method: "POST" });
    const data = await res.json();
    setNotice(res.ok ? `Synced. ${data.added || 0} new.` : data.error || "Sync failed.");
    setBusy(false);
    load();
  }

  async function open(message: Message) {
    if (!message.unread) return;
    await fetch(`/api/admin/outreach/messages/${message.id}`, { method: "PATCH" });
    setMessages((current) => current.map((item) => (item.id === message.id ? { ...item, unread: false } : item)));
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-[28px] font-semibold tracking-tight text-ink">Inbox</h2>
        <button className="btn" disabled={busy} onClick={sync}>
          {busy ? "Syncing…" : "Sync Gmail"}
        </button>
      </div>
      {notice && <p className="mt-4 text-[15px] text-muted">{notice}</p>}
      <div className="mt-6 space-y-3">
        {messages.length === 0 && <p className="text-[15px] text-muted">No correspondence yet.</p>}
        {messages.map((message) => (
          <button
            key={message.id}
            className="block w-full rounded-3xl bg-canvas p-5 text-left"
            onClick={() => open(message)}
          >
            <p className="text-[13px] text-muted">
              {message.unread ? "Unread · " : ""}
              {message.direction === "INBOUND" ? "Received" : "Sent"} · {new Date(message.occurredAt).toLocaleString()}
              {message.organization ? ` · ${message.organization.name}` : ""}
            </p>
            <p className="mt-1 text-[17px] font-medium text-ink">{message.subject}</p>
            <p className="mt-1 text-[13px] text-muted">
              {message.fromEmail} → {message.toEmail}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-ink">{message.body}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
