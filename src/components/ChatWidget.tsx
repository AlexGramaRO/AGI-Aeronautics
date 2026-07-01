"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  needsContact?: boolean;
};

const INTRO: Message = {
  role: "assistant",
  content:
    "Systems online. I'm the AGI Aeronautics assistant. Ask me anything about the AITC platform, and I'll pull from our knowledge base.",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INTRO]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contact, setContact] = useState({ name: "", email: "" });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, showContactForm]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setShowContactForm(false);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: nextMessages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error || "Something went wrong. Please try the contact form." },
        ]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, needsContact: data.needsContact }]);
      if (data.needsContact) setShowContactForm(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection lost. Please try again or use the contact form." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function submitContact() {
    if (!contact.name.trim() || !contact.email.trim()) return;

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

    await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: contact.name,
        email: contact.email,
        message: lastUserMessage || "Chatbot inquiry",
        context: messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n"),
        source: "CHATBOT",
      }),
    }).catch(() => null);

    setContactSent(true);
    setShowContactForm(false);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Thanks, ${contact.name.split(" ")[0]}. Your question has been forwarded to the AGI Aeronautics team - we'll reply to ${contact.email} shortly.`,
      },
    ]);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-4 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-xl border border-cyan-glow/25 bg-void-900/95 shadow-glow backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-cyan-glow/15 bg-void-800/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-glow shadow-glow-sm animate-pulse-slow" />
              <p className="font-mono text-xs uppercase tracking-widest text-slate-200">AGI Assistant</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-cyan-glow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-gradient-to-r from-accent-blue to-accent-cyan text-void-950"
                    : "border border-cyan-glow/15 bg-void-800/60 text-slate-200"
                }`}
              >
                {m.content}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-1 px-3 py-2">
                <span className="h-1.5 w-1.5 animate-blink rounded-full bg-cyan-glow" />
                <span className="h-1.5 w-1.5 animate-blink rounded-full bg-cyan-glow [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 animate-blink rounded-full bg-cyan-glow [animation-delay:0.4s]" />
              </div>
            )}

            {showContactForm && !contactSent && (
              <div className="corner-brackets rounded-lg border border-accent-amber/30 bg-void-800/70 p-3">
                <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-accent-amber">
                  Route to AGI team
                </p>
                <input
                  value={contact.name}
                  onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                  placeholder="Your name"
                  className="mb-2 w-full rounded-md border border-cyan-glow/20 bg-void-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-glow/60 focus:outline-none"
                />
                <input
                  value={contact.email}
                  onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                  placeholder="Your email address"
                  type="email"
                  className="mb-2 w-full rounded-md border border-cyan-glow/20 bg-void-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-glow/60 focus:outline-none"
                />
                <button
                  onClick={submitContact}
                  className="w-full rounded-md bg-gradient-to-r from-accent-blue to-accent-cyan px-3 py-2 text-sm font-semibold text-void-950 hover:opacity-90"
                >
                  Send to AGI Aeronautics
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-cyan-glow/15 bg-void-800/50 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about AITC..."
              className="flex-1 rounded-md border border-cyan-glow/20 bg-void-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-glow/60 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="rounded-md bg-gradient-to-r from-accent-blue to-accent-cyan px-3 py-2 text-void-950 disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 12l16-8-6 8 6 8-16-8z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent-blue to-accent-cyan text-void-950 shadow-glow transition hover:scale-105"
        aria-label="Open assistant"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3C7 3 3 6.6 3 11c0 2.2 1 4.2 2.6 5.6L5 21l4.4-1.7c.8.2 1.7.3 2.6.3 5 0 9-3.6 9-8s-4-8.6-9-8.6z"
              fill="currentColor"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
