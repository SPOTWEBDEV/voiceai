import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ ok: true });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ ok: true }); // don't reveal existence

  const token = nanoid(32);
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.verificationToken.upsert({
    where: { identifier: email },
    update: { token, expires },
    create: { identifier: email, token, expires },
  });

  // TODO: send email with reset link
  // Link: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&email=${email}
  console.log(`[DEV] Password reset: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&email=${email}`);

  return NextResponse.json({ ok: true });
}
