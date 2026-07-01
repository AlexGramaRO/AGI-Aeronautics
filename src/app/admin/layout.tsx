import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/knowledge", label: "Knowledge Base" },
  { href: "/admin/inquiries", label: "Inquiries" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-2 border-b border-cyan-glow/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-cyan-glow/80">
            // Restricted Access
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-slate-50">Admin Control Center</h1>
        </div>
        <p className="font-mono text-xs text-slate-500">
          Signed in as <span className="text-cyan-glow">{user.email}</span>
        </p>
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-md border border-cyan-glow/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-slate-300 transition hover:border-cyan-glow/50 hover:text-cyan-glow"
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}
