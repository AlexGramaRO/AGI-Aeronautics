"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", organization: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unable to register.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <h1 className="text-center text-[40px] font-semibold tracking-tight text-ink">Create your account.</h1>
        <p className="mt-2 text-center text-[17px] text-muted">Get early access to AITC.</p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] text-muted">Full name</label>
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
            <label className="mb-1.5 block text-[13px] text-muted">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="field"
            />
            <p className="mt-1 text-[12px] text-muted">Minimum 8 characters.</p>
          </div>

          {error && <p className="text-[15px] text-[#bf4800]">{error}</p>}

          <button type="submit" disabled={loading} className="btn w-full">
            {loading ? "Creating account…" : "Continue"}
          </button>
        </form>

        <p className="mt-6 text-center text-[15px] text-muted">
          Already registered?{" "}
          <Link href="/login" className="text-[#0066cc] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
