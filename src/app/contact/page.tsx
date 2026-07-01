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
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-center font-mono text-xs uppercase tracking-widest text-cyan-glow/80">
        // Ground Control
      </p>
      <h1 className="mt-2 text-center font-display text-3xl font-bold text-slate-50 sm:text-4xl">
        Talk to the AGI Aeronautics team
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-center text-slate-400">
        Questions about AITC, partnerships, or early access? Send us a message and a team
        member will respond directly to your email.
      </p>

      <div className="corner-brackets hud-panel mt-10 rounded-2xl p-8">
        {status === "sent" ? (
          <div className="py-10 text-center">
            <p className="font-display text-xl font-semibold text-slate-50">Message received.</p>
            <p className="mt-2 text-slate-400">
              Thank you for reaching out. Our team will reply to your email address shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-slate-400">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-md border border-cyan-glow/20 bg-void-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-cyan-glow/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-slate-400">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-md border border-cyan-glow/20 bg-void-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-cyan-glow/60 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-slate-400">
                Organization <span className="text-slate-600">(optional)</span>
              </label>
              <input
                value={form.organization}
                onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                className="w-full rounded-md border border-cyan-glow/20 bg-void-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-cyan-glow/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-slate-400">Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="w-full rounded-md border border-cyan-glow/20 bg-void-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-cyan-glow/60 focus:outline-none"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-400">Something went wrong. Please try again.</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-md bg-gradient-to-r from-accent-blue to-accent-cyan px-4 py-3 font-mono text-sm uppercase tracking-widest text-void-950 shadow-glow-sm transition hover:opacity-90 disabled:opacity-50"
            >
              {status === "sending" ? "Transmitting..." : "Send message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
