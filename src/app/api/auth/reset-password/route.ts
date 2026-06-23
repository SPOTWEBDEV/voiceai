import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { token, email, password } = await req.json();
  if (!token || !email || !password) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const record = await prisma.verificationToken.findFirst({ where: { identifier: email, token } });
  if (!record || record.expires < new Date()) return NextResponse.json({ error: "Link expired or invalid. Request a new one." }, { status: 400 });

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { email }, data: { password: hashed } });
  await prisma.verificationToken.delete({ where: { identifier: email } });

  return NextResponse.json({ ok: true });
}
