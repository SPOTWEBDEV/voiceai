import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, openrouterModel, smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom } = body;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name || undefined,
      openrouterModel: openrouterModel || null,
      smtpHost: smtpHost || null,
      smtpPort: smtpPort ? parseInt(String(smtpPort)) : null,
      smtpUser: smtpUser || null,
      smtpPass: smtpPass || null,
      smtpFrom: smtpFrom || null,
    },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json(user);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, openrouterModel: true, smtpHost: true, smtpPort: true, smtpUser: true, smtpPass: true, smtpFrom: true },
  });

  return NextResponse.json(user);
}
