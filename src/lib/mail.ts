import nodemailer from "nodemailer";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

export function gmailConfig() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return { user, pass };
}

export function gmailConfigured() {
  return gmailConfig() !== null;
}

export async function sendGmail(input: { to: string; subject: string; text: string }) {
  const auth = gmailConfig();
  if (!auth) {
    throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD are not set in Railway variables.");
  }

  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth,
  });

  const info = await transport.sendMail({
    from: `AGI Aeronautics <${auth.user}>`,
    to: input.to,
    subject: input.subject,
    text: input.text,
  });

  return { messageId: info.messageId || null };
}

export type SyncedMail = {
  gmailId: string;
  direction: "INBOUND" | "OUTBOUND";
  fromEmail: string;
  toEmail: string;
  subject: string;
  body: string;
  unread: boolean;
  occurredAt: Date;
};

export async function fetchRecentGmail(limit = 80): Promise<SyncedMail[]> {
  const auth = gmailConfig();
  if (!auth) {
    throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD are not set in Railway variables.");
  }

  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth,
    logger: false,
  });

  const ours = auth.user.toLowerCase();
  const messages: SyncedMail[] = [];

  await client.connect();
  const lock = await client.getMailboxLock("INBOX");
  try {
    const status = await client.status("INBOX", { messages: true });
    const total = status.messages || 0;
    if (total === 0) return [];
    const start = Math.max(1, total - limit + 1);

    for await (const message of client.fetch(`${start}:*`, {
      envelope: true,
      source: true,
      flags: true,
      uid: true,
    })) {
      const envelope = message.envelope;
      const from = envelope?.from?.[0]?.address?.toLowerCase() || "";
      const to = envelope?.to?.[0]?.address?.toLowerCase() || "";
      if (!from) continue;

      let body = envelope?.subject || "";
      if (message.source) {
        const parsed = await simpleParser(message.source);
        const html = typeof parsed.html === "string" ? parsed.html.replace(/<[^>]+>/g, " ") : "";
        body = parsed.text || html || body;
      }

      const gmailId = envelope?.messageId || `uid:${message.uid}`;
      const direction = from === ours ? "OUTBOUND" : "INBOUND";
      const seen = message.flags?.has("\\Seen") ?? false;

      messages.push({
        gmailId,
        direction,
        fromEmail: from,
        toEmail: direction === "OUTBOUND" ? to : ours,
        subject: envelope?.subject || "(no subject)",
        body: body.slice(0, 20000),
        unread: direction === "INBOUND" && !seen,
        occurredAt: envelope?.date || new Date(),
      });
    }
  } finally {
    lock.release();
    await client.logout();
  }

  return messages;
}
