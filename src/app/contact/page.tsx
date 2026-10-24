"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", organization: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "CONTACT_FORM" }),
      });

      if (!res.ok) {
        setStatus("error");
        return;
      }

      setStatus("sent");
      setForm({ name: "", email: "", organization: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-20">
      <h1 className="text-center text-[40px] font-semibold tracking-tight text-ink sm:text-[48px]">
        Talk to the team.
      </h1>
      <p className="mt-3 text-center text-[17px] leading-relaxed text-muted">
        Questions about AITC, partnerships, or early access. A person on the team will reply to your email.
      </p>

      <div className="mt-10">
        {status === "sent" ? (
          <div className="py-10 text-center">
            <p className="text-[28px] font-semibold tracking-tight text-ink">Message received.</p>
            <p className="mt-2 text-[17px] text-muted">We’ll reply to your email shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] text-muted">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="field"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] text-muted">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="field"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] text-muted">Organization</label>
              <input
                value={form.organization}
                onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                className="field"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] text-muted">Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="field"
              />
            </div>

            {status === "error" && (
              <p className="text-[15px] text-[#bf4800]">Something went wrong. Please try again.</p>
            )}

            <button type="submit" disabled={status === "sending"} className="btn w-full">
              {status === "sending" ? "Sending…" : "Send"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
