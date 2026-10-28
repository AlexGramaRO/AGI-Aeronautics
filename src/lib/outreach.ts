import { prisma } from "@/lib/db";
import { getOpenAI } from "@/lib/openai";

export const OUTREACH_MODELS = [
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-4.1-mini",
  "gpt-4.1",
] as const;

const MODEL_KEY = "openai_model";
const SIGNATURE_KEY = "gmail_signature";

export async function getOutreachModel() {
  const row = await prisma.appSetting.findUnique({ where: { key: MODEL_KEY } });
  if (row && OUTREACH_MODELS.includes(row.value as (typeof OUTREACH_MODELS)[number])) {
    return row.value;
  }
  return "gpt-4o-mini";
}

export async function getGmailSignature() {
  const row = await prisma.appSetting.findUnique({ where: { key: SIGNATURE_KEY } });
  return row?.value || "";
}

export async function setGmailSignature(signature: string) {
  const value = signature.trim();
  await prisma.appSetting.upsert({
    where: { key: SIGNATURE_KEY },
    update: { value },
    create: { key: SIGNATURE_KEY, value },
  });
  return value;
}

export async function setOutreachModel(model: string) {
  if (!OUTREACH_MODELS.includes(model as (typeof OUTREACH_MODELS)[number])) {
    throw new Error("Unknown model.");
  }
  await prisma.appSetting.upsert({
    where: { key: MODEL_KEY },
    update: { value: model },
    create: { key: MODEL_KEY, value: model },
  });
  return model;
}

export async function draftEmailForOrganization(organizationId: string, note: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      contacts: true,
      messages: { orderBy: { occurredAt: "desc" }, take: 12 },
    },
  });
  if (!org) throw new Error("Organisation not found.");

  const to = org.contacts.find((contact) => contact.email)?.email;
  if (!to) throw new Error(`${org.name} has no published email address.`);

  const history = org.messages
    .map(
      (message) =>
        `${message.occurredAt.toISOString()} ${message.direction} from ${message.fromEmail} to ${message.toEmail}\nSubject: ${message.subject}\n${message.body.slice(0, 1200)}`
    )
    .join("\n\n");

  const openai = getOpenAI();
  const model = await getOutreachModel();
  const completion = await openai.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content:
          "You draft outreach email for AGI Aeronautics about AiTC (Advanced intelligent Traffic Control), a browser-based air traffic control simulator. Be specific, concise, and professional. Do not invent contracts, prices, personal names, or previous meetings that are not in the record. Return JSON with keys subject and body. The body is plain text and signs off as AGI Aeronautics.",
      },
      {
        role: "user",
        content: `Organisation: ${org.name}
Kind: ${org.kind}
Place: ${org.city}, ${org.country}
Website: ${org.website || "unknown"}
ATM system: ${org.atmSystem || "not published"}
Simulator: ${org.simulatorKind}${org.simulatorVendor ? `, ${org.simulatorVendor}` : ""}
Acquired: ${org.simulatorAcquired || "not published"}
Price: ${org.simulatorPrice || "not published"}
Notes: ${org.notes || ""}

Previous correspondence:
${history || "None."}

Instruction from the sender:
${note}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw) as { subject?: string; body?: string };
  const subject = (parsed.subject || `AiTC for ${org.name}`).slice(0, 200);
  const body = (parsed.body || "").trim();
  if (!body) throw new Error(`The model returned an empty draft for ${org.name}.`);

  return prisma.mailDraft.create({
    data: {
      organizationId: org.id,
      toEmail: to,
      subject,
      body,
      note,
    },
  });
}
