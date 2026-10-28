"use client";

import { useEffect, useState } from "react";

export default function OutreachSettingsPage() {
  const [model, setModel] = useState("gpt-4o-mini");
  const [models, setModels] = useState<string[]>([]);
  const [openaiConfigured, setOpenaiConfigured] = useState(false);
  const [gmailConfigured, setGmailConfigured] = useState(false);
  const [gmailUser, setGmailUser] = useState("");
  const [signature, setSignature] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/outreach/settings")
      .then((res) => res.json())
      .then((data) => {
        setModel(data.model);
        setModels(data.models || []);
        setOpenaiConfigured(Boolean(data.openaiConfigured));
        setGmailConfigured(Boolean(data.gmailConfigured));
        setGmailUser(data.gmailUser || "");
        setSignature(data.signature || "");
      });
  }, []);

  async function save() {
    const res = await fetch("/api/admin/outreach/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, signature }),
    });
    const data = await res.json();
    setNotice(res.ok ? `Using ${data.model}.` : data.error || "Could not save.");
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-[28px] font-semibold tracking-tight text-ink">Mail settings</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        The OpenAI key stays in Railway, not in the database. Name it <span className="text-ink">OPENAI_API_KEY</span>.
        Gmail uses <span className="text-ink">GMAIL_USER</span> set to office@agi-aeronautics.com and{" "}
        <span className="text-ink">GMAIL_APP_PASSWORD</span>, a 16-character Google app password for that mailbox.
        The normal mailbox password is rejected. Gmail does not add its own signature to mail sent from this site,
        so paste that signature below. It is added when a draft is approved.
      </p>
      <p className="mt-4 text-[15px] text-ink">
        OpenAI key: {openaiConfigured ? "present" : "missing"}. Gmail:{" "}
        {gmailConfigured ? gmailUser || "present" : "missing"}.
      </p>
      <label className="mt-6 block text-[13px] text-muted">Model</label>
      <select className="field mt-1" value={model} onChange={(event) => setModel(event.target.value)}>
        {models.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <label className="mt-6 block text-[13px] text-muted">Gmail signature</label>
      <textarea
        className="field mt-1 min-h-[9rem]"
        value={signature}
        onChange={(event) => setSignature(event.target.value)}
        placeholder="Paste the signature from Gmail settings"
      />
      <button className="btn mt-4" onClick={save}>
        Save
      </button>
      {notice && <p className="mt-3 text-[15px] text-muted">{notice}</p>}
    </div>
  );
}
