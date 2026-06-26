import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await prisma.campaign.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { calls: true } },
      contactGroups: {
        include: {
          contactGroup: {
            select: { id: true, name: true, _count: { select: { contacts: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(campaigns);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, objective, script, systemPrompt, knowledgeBase, voice, contactGroupIds } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });
  if (!contactGroupIds || contactGroupIds.length === 0) {
    return NextResponse.json({ error: "Please select at least one contact group" }, { status: 400 });
  }

  // Verify all groups belong to user
  const groups = await prisma.contactGroup.findMany({
    where: { id: { in: contactGroupIds }, userId: session.user.id },
  });
  if (groups.length !== contactGroupIds.length) {
    return NextResponse.json({ error: "One or more contact groups not found" }, { status: 404 });
  }

  const campaign = await prisma.campaign.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      objective: objective?.trim() || null,
      script: script?.trim() || null,
      systemPrompt: systemPrompt?.trim() || null,
      knowledgeBase: knowledgeBase?.trim() || null,
      voice: voice || "alloy",
      contactGroups: {
        create: contactGroupIds.map((cgId: string) => ({ contactGroupId: cgId })),
      },
    },
    include: {
      contactGroups: { include: { contactGroup: { select: { id: true, name: true } } } },
    },
  });

  return NextResponse.json(campaign, { status: 201 });
}
