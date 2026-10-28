import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isStaffRole } from "@/lib/roles";

const schema = z.object({
  name: z.string().min(1).max(150),
  email: z.string().email(),
  organization: z.string().max(150).optional(),
  message: z.string().min(1).max(4000),
  context: z.string().max(4000).optional(),
  source: z.enum(["CONTACT_FORM", "CHATBOT"]).default("CONTACT_FORM"),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please fill in your name, email, and message." },
      { status: 400 }
    );
  }

  const inquiry = await prisma.inquiry.create({ data: parsed.data });

  return NextResponse.json({ ok: true, id: inquiry.id });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ inquiries });
}
