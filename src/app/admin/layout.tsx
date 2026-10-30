import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { isStaffRole } from "@/lib/roles";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || !isStaffRole(user.role)) {
    redirect("/login");
  }

  const record = await prisma.user.findUnique({ where: { id: user.sub }, select: { role: true } });
  const tabs = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/outreach", label: "Map" },
    { href: "/admin/outreach/drafts", label: "Drafts" },
    { href: "/admin/outreach/outbox", label: "Outbox" },
    { href: "/admin/outreach/inbox", label: "Inbox" },
    { href: "/admin/outreach/settings", label: "Mail" },
    { href: "/admin/knowledge", label: "Knowledge" },
    { href: "/admin/assistant", label: "Assistant" },
    { href: "/admin/inquiries", label: "Inquiries" },
    ...(record?.role === "SUPERADMIN" ? [{ href: "/admin/users", label: "People" }] : []),
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-[32px] font-semibold tracking-tight text-ink">Admin</h1>
        <p className="text-[13px] text-muted">{user.email}</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2 border-b border-black/10">
        {tabs.map((tab) => (
          <Link key={tab.href} href={tab.href} className="pb-3 text-[15px] text-ink/70 hover:text-ink">
            {tab.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}
