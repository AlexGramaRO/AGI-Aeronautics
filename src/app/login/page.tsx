"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unable to log in.");
        return;
      }

      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") ? next : data.user.role === "ADMIN" ? "/admin" : "/dashboard");
      router.refresh();
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 py-20">
      <div className="corner-brackets hud-panel w-full max-w-md rounded-2xl p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-cyan-glow/80">// Secure Access</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-slate-50">Log in to AGI Aeronautics</h1>
        <p className="mt-2 text-sm text-slate-400">Access your AITC dashboard.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
          <div>
            <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-slate-400">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full rounded-md border border-cyan-glow/20 bg-void-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-cyan-glow/60 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-gradient-to-r from-accent-blue to-accent-cyan px-4 py-2.5 font-mono text-sm uppercase tracking-widest text-void-950 shadow-glow-sm transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          No account yet?{" "}
          <Link href="/register" className="text-cyan-glow hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
