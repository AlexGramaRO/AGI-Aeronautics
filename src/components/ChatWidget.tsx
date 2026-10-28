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
    "Hello. Ask me anything about AiTC.",
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
        <div className="mb-4 flex h-[520px] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.16)]">
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
            <p className="text-[15px] font-medium text-ink">Assistant</p>
            <button onClick={() => setOpen(false)} className="text-muted hover:text-ink">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-[15px] leading-relaxed ${
                  m.role === "user" ? "ml-auto bg-apple text-white" : "bg-canvas text-ink"
                }`}
              >
                {m.content}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-1 px-3 py-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted [animation-delay:0.4s]" />
              </div>
            )}

            {showContactForm && !contactSent && (
              <div className="rounded-2xl bg-canvas p-3">
                <p className="mb-2 text-[13px] text-muted">Send this to the team</p>
                <input
                  value={contact.name}
                  onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                  placeholder="Your name"
                  className="field mb-2 !py-2 !text-[15px]"
                />
                <input
                  value={contact.email}
                  onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                  placeholder="Your email address"
                  type="email"
                  className="field mb-2 !py-2 !text-[15px]"
                />
                <button onClick={submitContact} className="btn w-full !py-2 !text-[15px]">
                  Send
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-black/10 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about AiTC"
              className="field flex-1 !py-2 !text-[15px]"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-apple text-white disabled:opacity-50"
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
        className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition hover:scale-105"
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
