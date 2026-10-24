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
    { label: "Knowledge documents", value: documentCount, href: "/admin/knowledge" },
    { label: "Embedded chunks", value: chunkCount, href: "/admin/knowledge" },
    { label: "New inquiries", value: newInquiries, href: "/admin/inquiries" },
    { label: "Total inquiries", value: totalInquiries, href: "/admin/inquiries" },
    { label: "Registered users", value: userCount, href: "#" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Link key={card.label} href={card.href} className="rounded-3xl bg-canvas p-6 transition hover:bg-[#ececf1]">
          <p className="text-[40px] font-semibold tracking-tight text-ink">{card.value}</p>
          <p className="mt-1 text-[15px] text-muted">{card.label}</p>
        </Link>
      ))}
    </div>
  );
}
