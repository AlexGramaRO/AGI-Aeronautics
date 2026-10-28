import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { isStaffRole } from "@/lib/roles";
import { OUTREACH_MODELS, getGmailSignature, getOutreachModel, setGmailSignature, setOutreachModel } from "@/lib/outreach";
import { gmailConfigured } from "@/lib/mail";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    model: await getOutreachModel(),
    models: OUTREACH_MODELS,
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    gmailConfigured: gmailConfigured(),
    gmailUser: process.env.GMAIL_USER || "",
    signature: await getGmailSignature(),
  });
}

const schema = z.object({ model: z.string(), signature: z.string().optional() });

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a model." }, { status: 400 });
  }

  try {
    const model = await setOutreachModel(parsed.data.model);
    const signature = parsed.data.signature === undefined ? await getGmailSignature() : await setGmailSignature(parsed.data.signature);
    return NextResponse.json({ model, signature });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save the model." },
      { status: 400 }
    );
  }
}
