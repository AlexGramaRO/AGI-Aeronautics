import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const me = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!me || me.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, organization: true, role: true, createdAt: true },
  });

  return NextResponse.json({ users });
}
