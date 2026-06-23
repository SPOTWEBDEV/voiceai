import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  objective: z.string().optional(),
  script: z.string().optional(),
  systemPrompt: z.string().optional(),
  knowledgeBase: z.string().optional(),
  voice: z.string().default("alloy"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const campaigns = await prisma.campaign.findMany({ where: { userId: session.user.id }, include: { _count: { select: { calls: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(campaigns);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const campaign = await prisma.campaign.create({ data: { ...parsed.data, userId: session.user.id } });
  return NextResponse.json(campaign, { status: 201 });
}
