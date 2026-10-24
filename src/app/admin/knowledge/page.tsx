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
      <div className="rounded-3xl bg-canvas p-6">
        <h2 className="text-[21px] font-semibold tracking-tight text-ink">Upload a document</h2>
        <p className="mt-2 text-[15px] text-muted">
          Accepted formats: .txt, .md, .pdf, .docx. The document is chunked and embedded with
          OpenAI, then used by the assistant to answer visitor questions.
        </p>

        <form onSubmit={handleUpload} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.pdf,.docx,text/plain,application/pdf"
            className="field flex-1 file:mr-3 file:rounded-full file:border-0 file:bg-apple file:px-3 file:py-1.5 file:text-white"
          />
          <button
            type="submit"
            disabled={uploading}
            className="btn disabled:opacity-50"
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

      <div className="rounded-3xl bg-canvas p-6">
        <h2 className="text-[21px] font-semibold tracking-tight text-ink">Indexed documents</h2>

        {loading ? (
          <p className="mt-4 text-[15px] text-muted">Loading...</p>
        ) : documents.length === 0 ? (
          <p className="mt-4 text-[15px] text-muted">No documents uploaded yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-[12px] text-muted">
                  <th className="py-2 pr-4">Filename</th>
                  <th className="py-2 pr-4">Chunks</th>
                  <th className="py-2 pr-4">Characters</th>
                  <th className="py-2 pr-4">Uploaded</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-black/5">
                    <td className="py-3 pr-4 text-ink">{doc.filename}</td>
                    <td className="py-3 pr-4 text-muted">{doc.chunkCount}</td>
                    <td className="py-3 pr-4 text-muted">{doc.charCount.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-muted">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-[13px] text-[#bf4800] hover:underline"
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
