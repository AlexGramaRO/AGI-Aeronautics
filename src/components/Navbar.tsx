"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SessionPayload } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/#platform", label: "Platform" },
  { href: "/#features", label: "Capabilities" },
  { href: "/#simulator", label: "Simulator" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar({ user }: { user: SessionPayload | null }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-cyan-glow/10 bg-void-950/70 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center">
          <span className="inline-flex rounded-lg bg-white p-1">
            <Image
              src="/logo/agi-mark.png"
              alt="AGI Aeronautics"
              width={662}
              height={662}
              className="h-9 w-9"
              priority
            />
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-xs uppercase tracking-widest text-slate-300 transition hover:text-cyan-glow"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="rounded-md border border-cyan-glow/30 px-4 py-2 font-mono text-xs uppercase tracking-widest text-cyan-glow transition hover:bg-cyan-glow/10"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="rounded-md border border-cyan-glow/30 px-4 py-2 font-mono text-xs uppercase tracking-widest text-slate-200 transition hover:bg-cyan-glow/10"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-md bg-gradient-to-r from-accent-blue to-accent-cyan px-4 py-2 font-mono text-xs uppercase tracking-widest text-void-950 shadow-glow-sm transition hover:opacity-90"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md border border-cyan-glow/30 px-4 py-2 font-mono text-xs uppercase tracking-widest text-slate-200 transition hover:bg-cyan-glow/10"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-gradient-to-r from-accent-blue to-accent-cyan px-4 py-2 font-mono text-xs uppercase tracking-widest text-void-950 shadow-glow-sm transition hover:opacity-90"
              >
                Get access
              </Link>
            </>
          )}
        </div>

        <button
          className="text-slate-200 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-cyan-glow/10 bg-void-950 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-mono text-sm uppercase tracking-widest text-slate-300"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              {user ? (
                <>
                  {user.role === "ADMIN" && (
                    <Link href="/admin" className="rounded-md border border-cyan-glow/30 px-4 py-2 text-center text-sm text-cyan-glow">
                      Admin
                    </Link>
                  )}
                  <Link href="/dashboard" className="rounded-md border border-cyan-glow/30 px-4 py-2 text-center text-sm text-slate-200">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="rounded-md bg-accent-blue px-4 py-2 text-center text-sm text-white">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="rounded-md border border-cyan-glow/30 px-4 py-2 text-center text-sm text-slate-200">
                    Log in
                  </Link>
                  <Link href="/register" className="rounded-md bg-accent-blue px-4 py-2 text-center text-sm text-white">
                    Get access
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
