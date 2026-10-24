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
  NEW: "bg-[#fff4e5] text-[#bf4800]",
  ANSWERED: "bg-[#e8f8ee] text-[#1d7a3a]",
  ARCHIVED: "bg-canvas text-muted",
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

  if (loading) return <p className="text-[15px] text-muted">Loading...</p>;

  if (inquiries.length === 0) {
    return (
      <div className="rounded-3xl bg-canvas p-10 text-center text-[15px] text-muted">
        No inquiries yet. Messages from the contact form and chatbot fallback will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => (
        <div key={inquiry.id} className="rounded-3xl bg-canvas p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-ink">{inquiry.name}</p>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-muted">
                  {inquiry.source === "CHATBOT" ? "Chat" : "Contact"}
                </span>
              </div>
              <p className="text-[13px] text-[#0066cc]">{inquiry.email}</p>
              {inquiry.organization && (
                <p className="text-[12px] text-muted">{inquiry.organization}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-1 text-[11px] ${STATUS_STYLES[inquiry.status]}`}>
                {inquiry.status}
              </span>
              <select
                value={inquiry.status}
                onChange={(e) => updateStatus(inquiry.id, e.target.value as Inquiry["status"])}
                className="rounded-full border border-black/10 bg-white px-2 py-1 text-[12px] text-ink"
              >
                <option value="NEW">New</option>
                <option value="ANSWERED">Answered</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <p className="mt-3 whitespace-pre-wrap text-[15px] text-ink">{inquiry.message}</p>

          {inquiry.context && (
            <div className="mt-3">
              <button
                onClick={() => setExpanded(expanded === inquiry.id ? null : inquiry.id)}
                className="text-[13px] text-[#0066cc] hover:underline"
              >
                {expanded === inquiry.id ? "Hide conversation" : "View full conversation"}
              </button>
              {expanded === inquiry.id && (
                <pre className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-white p-3 text-[12px] text-muted">
                  {inquiry.context}
                </pre>
              )}
            </div>
          )}

          <p className="mt-3 text-[12px] text-muted">
            {new Date(inquiry.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
