import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [users, contacts, campaigns, calls, completedCalls] = await Promise.all([
    prisma.user.count(),
    prisma.contact.count(),
    prisma.campaign.count(),
    prisma.call.count(),
    prisma.call.count({ where: { status: "COMPLETED" } }),
  ]);

  return NextResponse.json({ users, contacts, campaigns, calls, completedCalls });
}
