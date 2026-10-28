import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isStaffRole } from "@/lib/roles";

const schema = z.object({
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(20000),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Subject and body are required." }, { status: 400 });
  }

  const { id } = await params;
  const existing = await prisma.mailDraft.findUnique({ where: { id } });
  if (!existing || existing.status === "SENT") {
    return NextResponse.json({ error: "That message can no longer be edited." }, { status: 404 });
  }

  const draft = await prisma.mailDraft.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ draft });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.mailDraft.findUnique({ where: { id } });
  if (!existing || existing.status === "SENT") {
    return NextResponse.json({ error: "That message can no longer be deleted." }, { status: 404 });
  }

  await prisma.mailDraft.delete({ where: { id } });
  return NextResponse.json({ deleted: id });
}
