"use client";

import { useEffect, useState, type ReactNode } from "react";

type KnowledgeDocument = {
  id: string;
  filename: string;
  charCount: number;
  chunkCount: number;
  audience: "PUBLIC" | "ADMIN";
  createdAt: string;
};

const PACKAGES = [
  {
    href: "/knowledge/aitc-outreach-directory.pdf",
    filename: "aitc-outreach-directory.pdf",
    label: "Add the organisation directory",
  },
  {
    href: "/knowledge/aitc-outreach-strategy.pdf",
    filename: "aitc-outreach-strategy.pdf",
    label: "Replace the sales guide",
  },
];

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

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

  async function uploadFiles(files: File[], audience: "PUBLIC" | "ADMIN", replace = false) {
    const indexed: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("audience", audience);
      if (replace) formData.append("replace", "1");
      const res = await fetch("/api/admin/documents", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Could not index ${file.name}.`);
      indexed.push(`${data.document.filename} (${data.document.chunkCount} chunks)`);
    }
    return indexed;
  }

  async function onFiles(files: FileList | null, audience: "PUBLIC" | "ADMIN") {
    if (!files?.length) return;
    setBusy(audience);
    setMessage(null);
    try {
      const indexed = await uploadFiles(Array.from(files), audience);
      setMessage({ type: "success", text: `Indexed ${indexed.join(", ")}.` });
      await loadDocuments();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Upload failed." });
    } finally {
      setBusy(null);
    }
  }

  async function addPackage(href: string, filename: string) {
    setBusy(filename);
    setMessage(null);
    try {
      const res = await fetch(href);
      if (!res.ok) throw new Error("Could not read that package.");
      const blob = await res.blob();
      const indexed = await uploadFiles([new File([blob], filename, { type: "application/pdf" })], "ADMIN", true);
      setMessage({ type: "success", text: `Indexed ${indexed.join(", ")} into administrator knowledge.` });
      await loadDocuments();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Could not add that package." });
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this document and its embeddings?")) return;
    await fetch(`/api/admin/documents/${id}`, { method: "DELETE" });
    loadDocuments();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-canvas p-6">
        <h2 className="text-[21px] font-semibold tracking-tight text-ink">Two knowledge collections</h2>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted">
          Visitor documents are combined and used by the public website assistant. Administrator documents are combined and used only by the staff assistant. A question from a visitor never searches administrator documents.
        </p>
        {message && (
          <p className={`mt-3 text-sm ${message.type === "error" ? "text-[#bf4800]" : "text-[#248a3d]"}`}>{message.text}</p>
        )}
      </div>

      <Collection
        title="Visitor knowledge"
        detail="Every file here is searched together when a visitor asks the website assistant."
        documents={documents.filter((doc) => doc.audience !== "ADMIN")}
        loading={loading}
        busy={busy === "PUBLIC"}
        onFiles={(files) => onFiles(files, "PUBLIC")}
        onDelete={handleDelete}
      />

      <Collection
        title="Administrator knowledge"
        detail="Every file here is searched together when you use the staff assistant. The directory lists organisations. The sales guide is the book on how to sell AiTC. Replace the sales guide after a new version is published, so the assistant uses the latest text."
        documents={documents.filter((doc) => doc.audience === "ADMIN")}
        loading={loading}
        busy={busy === "ADMIN"}
        onFiles={(files) => onFiles(files, "ADMIN")}
        onDelete={handleDelete}
        extra={
          <div className="mt-4 flex flex-wrap gap-3">
            {PACKAGES.map((item) => (
              <span key={item.filename} className="flex items-center gap-3">
                <a className="text-[14px] text-[#0066cc]" href={item.href} target="_blank" rel="noreferrer">
                  {item.filename}
                </a>
                <button
                  className="text-[14px] text-ink underline"
                  disabled={busy !== null}
                  onClick={() => addPackage(item.href, item.filename)}
                >
                  {busy === item.filename ? "Indexing..." : item.label}
                </button>
              </span>
            ))}
          </div>
        }
      />
    </div>
  );
}

function Collection({
  title,
  detail,
  documents,
  loading,
  busy,
  onFiles,
  onDelete,
  extra,
}: {
  title: string;
  detail: string;
  documents: KnowledgeDocument[];
  loading: boolean;
  busy: boolean;
  onFiles: (files: FileList | null) => void;
  onDelete: (id: string) => void;
  extra?: ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-canvas p-6">
      <h2 className="text-[21px] font-semibold tracking-tight text-ink">{title}</h2>
      <p className="mt-2 text-[15px] text-muted">{detail}</p>
      <form
        className="mt-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          const input = event.currentTarget.elements.namedItem("files") as HTMLInputElement;
          onFiles(input.files);
          input.value = "";
        }}
      >
        <input
          name="files"
          type="file"
          multiple
          accept=".txt,.md,.pdf,.docx,text/plain,application/pdf"
          className="field flex-1 file:mr-3 file:rounded-full file:border-0 file:bg-apple file:px-3 file:py-1.5 file:text-white"
        />
        <button className="btn disabled:opacity-50" disabled={busy}>
          {busy ? "Processing..." : "Upload and embed"}
        </button>
      </form>
      {extra}
      {loading ? (
        <p className="mt-4 text-[15px] text-muted">Loading...</p>
      ) : documents.length === 0 ? (
        <p className="mt-4 text-[15px] text-muted">No documents in this collection yet.</p>
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
                  <td className="py-3 pr-4 text-muted">{new Date(doc.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => onDelete(doc.id)} className="text-[13px] text-[#bf4800] hover:underline">
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
  );
}
