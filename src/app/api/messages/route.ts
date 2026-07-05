import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messages = await prisma.message.findMany({
    where: { userId: session.user.id },
    include: {
      contact: { select: { name: true, phone: true, email: true } },
      campaign: { select: { name: true, channelType: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(messages);
}
