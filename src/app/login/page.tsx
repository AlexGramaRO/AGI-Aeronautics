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
      <div className="w-full max-w-md">
        <h1 className="text-center text-[40px] font-semibold tracking-tight text-ink">Log in.</h1>
        <p className="mt-2 text-center text-[17px] text-muted">Access your AITC dashboard.</p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
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
            <label className="mb-1.5 block text-[13px] text-muted">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="field"
            />
          </div>

          {error && <p className="text-[15px] text-[#bf4800]">{error}</p>}

          <button type="submit" disabled={loading} className="btn w-full">
            {loading ? "Signing in…" : "Continue"}
          </button>
        </form>

        <p className="mt-6 text-center text-[15px] text-muted">
          No account yet?{" "}
          <Link href="/register" className="text-[#0066cc] hover:underline">
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
