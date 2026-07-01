"use client";

import { useEffect, useState } from "react";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  organization?: string | null;
  message: string;
  context?: string | null;
  source: "CONTACT_FORM" | "CHATBOT";
  status: "NEW" | "ANSWERED" | "ARCHIVED";
  createdAt: string;
};

const STATUS_STYLES: Record<Inquiry["status"], string> = {
  NEW: "bg-accent-amber/15 text-accent-amber border-accent-amber/30",
  ANSWERED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  ARCHIVED: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/inquiries");
    const data = await res.json();
    setInquiries(data.inquiries ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: Inquiry["status"]) {
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    await fetch(`/api/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  if (loading) return <p className="text-sm text-slate-500">Loading...</p>;

  if (inquiries.length === 0) {
    return (
      <div className="hud-panel corner-brackets rounded-2xl p-10 text-center text-slate-500">
        No inquiries yet. Messages from the contact form and chatbot fallback will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => (
        <div key={inquiry.id} className="hud-panel corner-brackets rounded-xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display font-semibold text-slate-100">{inquiry.name}</p>
                <span className="rounded-full border border-cyan-glow/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-slate-400">
                  {inquiry.source === "CHATBOT" ? "Chatbot" : "Contact Form"}
                </span>
              </div>
              <p className="font-mono text-xs text-cyan-glow/80">{inquiry.email}</p>
              {inquiry.organization && (
                <p className="text-xs text-slate-500">{inquiry.organization}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className={`rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${STATUS_STYLES[inquiry.status]}`}>
                {inquiry.status}
              </span>
              <select
                value={inquiry.status}
                onChange={(e) => updateStatus(inquiry.id, e.target.value as Inquiry["status"])}
                className="rounded-md border border-cyan-glow/20 bg-void-950/60 px-2 py-1 text-xs text-slate-200"
              >
                <option value="NEW">New</option>
                <option value="ANSWERED">Answered</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{inquiry.message}</p>

          {inquiry.context && (
            <div className="mt-3">
              <button
                onClick={() => setExpanded(expanded === inquiry.id ? null : inquiry.id)}
                className="font-mono text-xs uppercase tracking-widest text-cyan-glow/70 hover:text-cyan-glow"
              >
                {expanded === inquiry.id ? "Hide conversation" : "View full conversation"}
              </button>
              {expanded === inquiry.id && (
                <pre className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md border border-cyan-glow/10 bg-void-950/60 p-3 text-xs text-slate-400">
                  {inquiry.context}
                </pre>
              )}
            </div>
          )}

          <p className="mt-3 font-mono text-[11px] text-slate-600">
            {new Date(inquiry.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
