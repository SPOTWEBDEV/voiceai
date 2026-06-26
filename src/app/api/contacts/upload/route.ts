import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    error: "Please use /api/contact-groups/{groupId}/upload to upload contacts to a specific group.",
  }, { status: 400 });
}
