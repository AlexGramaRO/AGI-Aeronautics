import nodemailer from "nodemailer";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

export function gmailConfig() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "").replace(/^["']|["']$/g, "");
  if (!user || !pass) return null;
  return { user, pass };
}

export function gmailConfigured() {
  return gmailConfig() !== null;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function messageWithSignature(body: string, signature?: string) {
  const clean = signature?.trim() || "";
  if (!clean) return { text: body, html: undefined as string | undefined };
  const textSignature = clean
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
  const text = `${body.replace(/\s+$/, "")}\n\n${textSignature}`;
  const htmlBody = escapeHtml(body).replace(/\n/g, "<br>");
  const signatureHtml = /<\/?[a-z][\s\S]*>/i.test(clean)
    ? clean
    : escapeHtml(textSignature).replace(/\n/g, "<br>");
  return { text, html: `${htmlBody}<br><br>${signatureHtml}` };
}

export async function sendGmail(input: { to: string; subject: string; text: string; signature?: string }) {
  const auth = gmailConfig();
  if (!auth) {
    throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD are not set in Railway or Cloudflare variables.");
  }

  const message = messageWithSignature(input.text, input.signature);
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth,
  });

  try {
    const info = await transport.sendMail({
      from: `AGI Aeronautics <${auth.user}>`,
      to: input.to,
      subject: input.subject,
      text: message.text,
      html: message.html,
    });
    return { messageId: info.messageId || null, text: message.text };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Send failed.";
    if (detail.includes("535") || detail.includes("BadCredentials")) {
      throw new Error(
        "Google rejected the mailbox login. GMAIL_APP_PASSWORD must be a 16-character app password created for this exact mailbox, not the normal account password. Turn on 2-Step Verification, then create one at https://myaccount.google.com/apppasswords. There is no approval step in Gmail until that app password is accepted."
      );
    }
    throw error;
  }
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
    throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD are not set in Railway or Cloudflare variables.");
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
    const total = status ? status.messages || 0 : 0;
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
      const rawDate = envelope?.date;
      const occurredAt = rawDate instanceof Date ? rawDate : rawDate ? new Date(rawDate) : new Date();

      messages.push({
        gmailId,
        direction,
        fromEmail: from,
        toEmail: direction === "OUTBOUND" ? to : ours,
        subject: envelope?.subject || "(no subject)",
        body: body.slice(0, 20000),
        unread: direction === "INBOUND" && !seen,
        occurredAt,
      });
    }
  } finally {
    lock.release();
    await client.logout();
  }

  return messages;
}
