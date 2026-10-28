import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isStaffRole } from "@/lib/roles";

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
  if (!parsed.success || (!parsed.data.all && !parsed.data.ids?.length)) {
    return NextResponse.json({ error: "Nothing to approve." }, { status: 400 });
  }

  const result = await prisma.mailDraft.updateMany({
    where: {
      status: "PENDING",
      ...(parsed.data.all ? {} : { id: { in: parsed.data.ids || [] } }),
    },
    data: { status: "OUTBOX" },
  });

  return NextResponse.json({ moved: result.count });
}
