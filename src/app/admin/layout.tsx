import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/knowledge", label: "Knowledge" },
  { href: "/admin/inquiries", label: "Inquiries" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-[32px] font-semibold tracking-tight text-ink">Admin</h1>
        <p className="text-[13px] text-muted">{user.email}</p>
      </div>

      <div className="mb-8 flex gap-6 border-b border-black/10">
        {TABS.map((tab) => (
          <Link key={tab.href} href={tab.href} className="pb-3 text-[15px] text-ink/70 hover:text-ink">
            {tab.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}
