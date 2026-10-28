import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isStaffRole } from "@/lib/roles";
import { sendGmail } from "@/lib/mail";
import { getGmailSignature } from "@/lib/outreach";

const schema = z.object({
  ids: z.array(z.string()).optional(),
  all: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nothing to approve." }, { status: 400 });
  }

  const drafts = await prisma.mailDraft.findMany({
    where: {
      status: "PENDING",
      ...(parsed.data.all ? {} : { id: { in: parsed.data.ids || [] } }),
    },
  });

  const sent: string[] = [];
  const failed: string[] = [];
  const signature = await getGmailSignature();

  for (const draft of drafts) {
    try {
      const result = await sendGmail({
        to: draft.toEmail,
        subject: draft.subject,
        text: draft.body,
        signature,
      });
      await prisma.mailDraft.update({ where: { id: draft.id }, data: { status: "SENT" } });
      try {
        await prisma.mailMessage.create({
          data: {
            organizationId: draft.organizationId,
            direction: "OUTBOUND",
            fromEmail: (process.env.GMAIL_USER || "").toLowerCase(),
            toEmail: draft.toEmail,
            subject: draft.subject,
            body: result.text,
            gmailId: result.messageId,
            unread: false,
          },
        });
      } catch (error) {
        await prisma.mailDraft.update({ where: { id: draft.id }, data: { status: "PENDING" } }).catch(() => null);
        throw error;
      }
      sent.push(draft.id);
    } catch (error) {
      failed.push(error instanceof Error ? error.message : "Send failed.");
    }
  }

  return NextResponse.json({ sent: sent.length, failed });
}
