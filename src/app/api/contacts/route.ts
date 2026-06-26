import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Return all contacts across all user's groups
  const contacts = await prisma.contact.findMany({
    where: { contactGroup: { userId: session.user.id } },
    include: { contactGroup: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return NextResponse.json(contacts);
}
