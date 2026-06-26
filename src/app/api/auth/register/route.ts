import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, password } = body;

  if (!name || name.trim().length < 2) return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
  if (!email || !email.includes("@")) return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  if (!password || password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name: name.trim(), email: email.toLowerCase().trim(), password: hashed },
    select: { id: true, email: true, name: true },
  });

  return NextResponse.json(user, { status: 201 });
}
