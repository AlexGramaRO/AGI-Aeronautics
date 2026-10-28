"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SessionPayload } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/#platform", label: "Platform" },
  { href: "/#features", label: "Capabilities" },
  { href: "/#simulator", label: "Devices" },
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
    <header className="fixed top-0 z-50 w-full border-b border-black/10 bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-12 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2" aria-label="AGI Aeronautics">
          <Image src="/logo/agi-mark.png" alt="" width={662} height={662} className="h-7 w-7" priority />
          <span className="text-[15px] font-medium tracking-tight text-ink">AGI Aeronautics</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-[12px] text-ink/80 transition hover:text-ink">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-5 md:flex">
          {user ? (
            <>
              {(user.role === "ADMIN" || user.role === "SUPERADMIN") && (
                <Link href="/admin" className="text-[12px] text-ink/80 hover:text-ink">
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className="text-[12px] text-ink/80 hover:text-ink">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-[12px] text-[#0066cc]">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-[12px] text-ink/80 hover:text-ink">
                Log in
              </Link>
              <Link href="/register" className="text-[12px] text-[#0066cc]">
                Get access
              </Link>
            </>
          )}
        </div>

        <button className="text-ink md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-black/10 bg-white px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-[17px] text-ink">
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                {(user.role === "ADMIN" || user.role === "SUPERADMIN") && (
                  <Link href="/admin" className="text-[17px] text-ink">
                    Admin
                  </Link>
                )}
                <Link href="/dashboard" className="text-[17px] text-ink">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="text-left text-[17px] text-[#0066cc]">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-[17px] text-ink">
                  Log in
                </Link>
                <Link href="/register" className="text-[17px] text-[#0066cc]">
                  Get access
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
