import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isStaffRole } from "@/lib/roles";
import { fetchRecentGmail } from "@/lib/mail";

export const runtime = "nodejs";
export const maxDuration = 120;

async function staff() {
  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) return null;
  return user;
}

export async function GET() {
  if (!(await staff())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.mailMessage.findMany({
    orderBy: { occurredAt: "desc" },
    take: 200,
    include: { organization: { select: { id: true, name: true, city: true, country: true } } },
  });

  return NextResponse.json({ messages });
}

export async function POST() {
  if (!(await staff())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contacts = await prisma.contact.findMany({
    where: { email: { not: null } },
    select: { email: true, organizationId: true },
  });
  const byEmail = new Map<string, string>();
  for (const contact of contacts) {
    if (contact.email) byEmail.set(contact.email.toLowerCase(), contact.organizationId);
  }

  let fetched;
  try {
    fetched = await fetchRecentGmail();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not read Gmail." },
      { status: 500 }
    );
  }

  let added = 0;
  for (const message of fetched) {
    const organizationId =
      byEmail.get(message.fromEmail) || byEmail.get(message.toEmail) || null;
    const existing = await prisma.mailMessage.findUnique({ where: { gmailId: message.gmailId } });
    if (existing) {
      if (existing.unread !== message.unread) {
        await prisma.mailMessage.update({
          where: { id: existing.id },
          data: { unread: message.unread },
        });
      }
      continue;
    }
    await prisma.mailMessage.create({
      data: {
        organizationId,
        direction: message.direction,
        fromEmail: message.fromEmail,
        toEmail: message.toEmail,
        subject: message.subject,
        body: message.body,
        gmailId: message.gmailId,
        unread: message.unread,
        occurredAt: message.occurredAt,
      },
    });
    added += 1;
  }

  return NextResponse.json({ added });
}
