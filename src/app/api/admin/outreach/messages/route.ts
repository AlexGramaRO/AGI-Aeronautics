import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isStaffRole } from "@/lib/roles";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ids = (request.nextUrl.searchParams.get("organizationIds") || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const messages = await prisma.mailMessage.findMany({
    where: ids.length ? { organizationId: { in: ids } } : undefined,
    orderBy: { occurredAt: "desc" },
    take: 200,
    include: { organization: { select: { id: true, name: true, city: true, country: true } } },
  });

  return NextResponse.json({ messages });
}
