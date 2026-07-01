"use client";

import { useEffect, useRef, useState } from "react";

type Document = {
  id: string;
  filename: string;
  mimeType: string;
  charCount: number;
  chunkCount: number;
  createdAt: string;
  uploadedBy?: { name: string; email: string } | null;
};

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadDocuments() {
    setLoading(true);
    const res = await fetch("/api/admin/documents");
    const data = await res.json();
    setDocuments(data.documents ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/documents", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Upload failed." });
        return;
      }

      setMessage({
        type: "success",
        text: `Indexed "${data.document.filename}" into ${data.document.chunkCount} chunks.`,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadDocuments();
    } catch {
      setMessage({ type: "error", text: "Upload failed. Please try again." });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this document and its embeddings from the knowledge base?")) return;
    await fetch(`/api/admin/documents/${id}`, { method: "DELETE" });
    loadDocuments();
  }

  return (
    <div className="space-y-8">
      <div className="hud-panel corner-brackets rounded-2xl p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-cyan-glow/80">// Ingest Knowledge</p>
        <h2 className="mt-2 font-display text-xl font-semibold text-slate-50">Upload a document</h2>
        <p className="mt-2 text-sm text-slate-400">
          Accepted formats: .txt, .md, .pdf, .docx. The document is chunked and embedded with
          OpenAI, then used by the assistant to answer visitor questions.
        </p>

        <form onSubmit={handleUpload} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.pdf,.docx,text/plain,application/pdf"
            className="flex-1 rounded-md border border-cyan-glow/20 bg-void-950/60 px-4 py-2.5 text-sm text-slate-200 file:mr-3 file:rounded-md file:border-0 file:bg-accent-blue/20 file:px-3 file:py-1.5 file:text-cyan-glow"
          />
          <button
            type="submit"
            disabled={uploading}
            className="rounded-md bg-gradient-to-r from-accent-blue to-accent-cyan px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-void-950 disabled:opacity-50"
          >
            {uploading ? "Processing..." : "Upload & Embed"}
          </button>
        </form>

        {message && (
          <p className={`mt-3 text-sm ${message.type === "error" ? "text-red-400" : "text-emerald-400"}`}>
            {message.text}
          </p>
        )}
      </div>

      <div className="hud-panel corner-brackets rounded-2xl p-6">
        <h2 className="font-display text-xl font-semibold text-slate-50">Indexed documents</h2>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading...</p>
        ) : documents.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No documents uploaded yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-cyan-glow/10 font-mono text-xs uppercase tracking-widest text-slate-500">
                  <th className="py-2 pr-4">Filename</th>
                  <th className="py-2 pr-4">Chunks</th>
                  <th className="py-2 pr-4">Characters</th>
                  <th className="py-2 pr-4">Uploaded</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-cyan-glow/5">
                    <td className="py-3 pr-4 text-slate-200">{doc.filename}</td>
                    <td className="py-3 pr-4 text-slate-400">{doc.chunkCount}</td>
                    <td className="py-3 pr-4 text-slate-400">{doc.charCount.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-slate-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="font-mono text-xs uppercase tracking-widest text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
