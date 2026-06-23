import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // In production, save to a PlatformConfig table or update env
  // For now, we just acknowledge the save
  const body = await req.json();
  console.log("[Admin] Platform settings update:", Object.keys(body));

  return NextResponse.json({ ok: true });
}
