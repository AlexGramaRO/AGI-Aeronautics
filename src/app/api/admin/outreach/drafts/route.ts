import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isStaffRole } from "@/lib/roles";
import { draftEmailForOrganization } from "@/lib/outreach";

export const runtime = "nodejs";
export const maxDuration = 300;

const schema = z.object({
  organizationIds: z.array(z.string()).min(1).max(40),
  note: z.string().min(1).max(4000),
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const requested = request.nextUrl.searchParams.get("status");
  const status = requested === "OUTBOX" ? "OUTBOX" : "PENDING";
  const drafts = await prisma.mailDraft.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
    include: { organization: { select: { id: true, name: true, city: true, country: true } } },
  });

  return NextResponse.json({ drafts });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose at least one location and a note." }, { status: 400 });
  }

  const created = [];
  const skipped: string[] = [];

  for (const organizationId of parsed.data.organizationIds) {
    try {
      created.push(await draftEmailForOrganization(organizationId, parsed.data.note));
    } catch (error) {
      skipped.push(error instanceof Error ? error.message : "Draft failed.");
    }
  }

  return NextResponse.json({ created: created.length, skipped });
}
