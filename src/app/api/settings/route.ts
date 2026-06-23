import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, openrouterKey, openrouterModel } = await req.json();

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name || undefined,
      openrouterKey: openrouterKey || null,
      openrouterModel: openrouterModel || null,
    },
    select: { id: true, name: true, email: true, openrouterKey: true, openrouterModel: true },
  });

  return NextResponse.json(user);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, openrouterKey: true, openrouterModel: true },
  });

  return NextResponse.json(user);
}
