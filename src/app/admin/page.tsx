import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [documentCount, chunkCount, newInquiries, totalInquiries, userCount] = await Promise.all([
    prisma.document.count(),
    prisma.knowledgeChunk.count(),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.inquiry.count(),
    prisma.user.count({ where: { role: "USER" } }),
  ]);

  const cards = [
    { label: "Knowledge Documents", value: documentCount, href: "/admin/knowledge" },
    { label: "Embedded Chunks", value: chunkCount, href: "/admin/knowledge" },
    { label: "New Inquiries", value: newInquiries, href: "/admin/inquiries" },
    { label: "Total Inquiries", value: totalInquiries, href: "/admin/inquiries" },
    { label: "Registered Users", value: userCount, href: "#" },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className="corner-brackets hud-panel rounded-xl p-6 transition hover:border-cyan-glow/40"
        >
          <p className="font-display text-3xl font-bold text-gradient">{card.value}</p>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-slate-400">{card.label}</p>
        </Link>
      ))}
    </div>
  );
}
