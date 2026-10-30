import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isStaffRole } from "@/lib/roles";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const organizations = await prisma.organization.findMany({
    include: {
      contacts: true,
      messages: {
        select: { direction: true, unread: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    organizations: organizations.map((org) => ({
      ...org,
      sentCount: org.messages.filter((message) => message.direction === "OUTBOUND").length,
      receivedCount: org.messages.filter((message) => message.direction === "INBOUND").length,
      unreadCount: org.messages.filter((message) => message.direction === "INBOUND" && message.unread).length,
      messages: undefined,
    })),
  });
}
