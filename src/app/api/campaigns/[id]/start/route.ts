import { NextRequest, NextResponse } from "next/server";

// This route is kept for backwards compatibility
// The start logic has been moved to POST /api/campaigns/[id]?action=start
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Forward to the main route with action=start
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:3000`;
  const res = await fetch(`${baseUrl}/api/campaigns/${id}?action=start`, {
    method: "POST",
    headers: {
      cookie: req.headers.get("cookie") || "",
    },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
