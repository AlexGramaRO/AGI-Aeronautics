"use client";

import { useState } from "react";

type Turn = { role: "user" | "assistant"; content: string };

export default function AdminAssistantPage() {
  const [messages, setMessages] = useState<Turn[]>([
    {
      role: "assistant",
      content:
        "Ask about the organisations on the map, or about how to make first contact, follow up, and offer an AiTC trial. Answers come only from administrator documents.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10).map((item) => ({ role: item.role, content: item.content })),
        }),
      });
      const data = await res.json();
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply || data.error || "The assistant did not reply." },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: "Connection lost. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl bg-canvas p-6">
      <h2 className="text-[21px] font-semibold tracking-tight text-ink">Administrator assistant</h2>
      <p className="mt-2 text-[15px] text-muted">
        This assistant reads every administrator document together. It does not read visitor knowledge, and the public website assistant does not read these documents.
      </p>
      <div className="mt-5 space-y-3">
        {messages.map((message, index) => (
          <p
            key={`${message.role}-${index}`}
            className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] ${
              message.role === "user" ? "bg-white text-ink" : "text-ink"
            }`}
          >
            {message.content}
          </p>
        ))}
      </div>
      <form
        className="mt-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}
      >
        <input
          className="field flex-1"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Which mailbox is published for this organisation?"
        />
        <button className="btn disabled:opacity-50" disabled={loading || !input.trim()}>
          {loading ? "Asking..." : "Ask"}
        </button>
      </form>
    </div>
  );
}
