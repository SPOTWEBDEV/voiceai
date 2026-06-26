import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initiateCall, getPhoneNumber } from "@/lib/twilio";

// ── GET campaign ──────────────────────────────────────────────────────────────
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaign = await prisma.campaign.findFirst({
    where: { id, userId: session.user.id },
    include: {
      contactGroups: {
        include: { contactGroup: { select: { id: true, name: true, _count: { select: { contacts: true } } } } },
      },
      calls: { include: { contact: true } },
    },
  });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(campaign);
}

// ── POST — either start campaign or update status ─────────────────────────────
// POST /api/campaigns/[id]?action=start  → start the campaign
// POST /api/campaigns/[id]               → update status (e.g. pause)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ── START action ────────────────────────────────────────────────────────────
  if (action === "start") {
    const campaign = await prisma.campaign.findFirst({
      where: { id, userId: session.user.id },
      include: {
        contactGroups: {
          include: {
            contactGroup: { include: { contacts: { where: { status: "PENDING" } } } },
          },
        },
      },
    });

    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    if (campaign.contactGroups.length === 0) {
      return NextResponse.json({
        error: "No contact groups assigned. Edit the campaign and select at least one contact group.",
      }, { status: 400 });
    }

    // Gather all pending contacts
    const allContacts: { id: string; phone: string; name: string }[] = [];
    for (const cg of campaign.contactGroups) {
      for (const c of cg.contactGroup.contacts) {
        allContacts.push({ id: c.id, phone: c.phone, name: c.name });
      }
    }



    if (allContacts.length === 0) {
      return NextResponse.json({
        error: "No pending contacts in any assigned group. All contacts may have already been called.",
      }, { status: 400 });
    }

    // Get credentials
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twilioSid: true, twilioToken: true, twilioPhone: true },
    });

    const fromNumber = getPhoneNumber(user?.twilioPhone || undefined);
    const accountSid = user?.twilioSid || process.env.TWILIO_ACCOUNT_SID;
    const authToken = user?.twilioToken || process.env.TWILIO_AUTH_TOKEN;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    // Validate before calling
    if (!fromNumber) return NextResponse.json({ error: "Twilio phone number not set. Add TWILIO_PHONE_NUMBER to your .env.local file." }, { status: 400 });
    if (!accountSid) return NextResponse.json({ error: "Twilio Account SID not set. Add TWILIO_ACCOUNT_SID to your .env.local file." }, { status: 400 });
    if (!authToken) return NextResponse.json({ error: "Twilio Auth Token not set. Add TWILIO_AUTH_TOKEN to your .env.local file." }, { status: 400 });
    if (!appUrl || appUrl.includes("localhost")) {
      return NextResponse.json({
        error: "NEXT_PUBLIC_APP_URL must be a public URL for Twilio to reach your webhooks. Use ngrok for local dev: https://ngrok.com",
      }, { status: 400 });
    }

    // Make calls
    const callResults: { contactId: string; callId: string; sid?: string; error?: string }[] = [];
    let successCount = 0;
    let failCount = 0;

    for (const contact of allContacts) {
      let callId: string | null = null;
      try {
        const call = await prisma.call.create({
          data: { userId: session.user.id, contactId: contact.id, campaignId: campaign.id, status: "QUEUED" },
        });
        callId = call.id;

        console.log("Contact Numbering " + contact.phone)

        // Find this block inside your "for (const contact of allContacts)" loop:

        const twilioCall = await initiateCall({
          to: contact.phone.startsWith('+') ? contact.phone : `+${contact.phone}`, // <-- FIX IS HERE
          from: fromNumber,
          callbackUrl: `${appUrl}/api/twilio/voice?callId=${call.id}`,
          accountSid,
          authToken,
        });

        await prisma.call.update({
          where: { id: call.id },
          data: { twilioSid: twilioCall.sid, status: "RINGING", startedAt: new Date() },
        });
        await prisma.contact.update({ where: { id: contact.id }, data: { status: "CALLED" } });

        callResults.push({ contactId: contact.id, callId: call.id, sid: twilioCall.sid });
        successCount++;
      } catch (err: any) {
        const errMsg = err?.message || "Unknown Twilio error";
        console.error(`Failed to call ${contact.phone}:`, errMsg);
        if (callId) {
          await prisma.call.update({ where: { id: callId }, data: { status: "FAILED", errorMessage: errMsg } });
        }
        callResults.push({ contactId: contact.id, callId: callId || "", error: errMsg });
        failCount++;
      }
    }

    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: successCount > 0 ? "ACTIVE" : "FAILED" },
    });

    if (successCount === 0) {
      const firstError = callResults.find((r) => r.error)?.error || "All calls failed";
      return NextResponse.json({
        error: `All ${failCount} calls failed. Error: ${firstError}`,
        started: 0, failed: failCount, calls: callResults,
      }, { status: 400 });
    }

    return NextResponse.json({
      started: successCount,
      failed: failCount,
      total: allContacts.length,
      calls: callResults,
      message: failCount > 0
        ? `${successCount} calls started, ${failCount} failed`
        : `${successCount} calls started successfully`,
    });
  }

  // ── Default POST — update status ────────────────────────────────────────────
  const body = await req.json();
  const { status } = body;
  const campaign = await prisma.campaign.update({
    where: { id, userId: session.user.id },
    data: { status },
  });
  return NextResponse.json(campaign);
}

// ── PATCH — edit campaign ─────────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, objective, script, systemPrompt, knowledgeBase, voice, contactGroupIds } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });

  if (contactGroupIds && contactGroupIds.length > 0) {
    const groups = await prisma.contactGroup.findMany({
      where: { id: { in: contactGroupIds }, userId: session.user.id },
    });
    if (groups.length !== contactGroupIds.length) {
      return NextResponse.json({ error: "One or more contact groups not found" }, { status: 404 });
    }
  }

  await prisma.campaignContactGroup.deleteMany({ where: { campaignId: id } });

  const campaign = await prisma.campaign.update({
    where: { id, userId: session.user.id },
    data: {
      name: name.trim(),
      objective: objective?.trim() || null,
      script: script?.trim() || null,
      systemPrompt: systemPrompt?.trim() || null,
      knowledgeBase: knowledgeBase?.trim() || null,
      voice: voice || "alloy",
      contactGroups: contactGroupIds?.length > 0
        ? { create: contactGroupIds.map((cgId: string) => ({ contactGroupId: cgId })) }
        : undefined,
    },
    include: {
      contactGroups: { include: { contactGroup: { select: { id: true, name: true } } } },
    },
  });

  return NextResponse.json(campaign);
}

// ── DELETE campaign ───────────────────────────────────────────────────────────
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.campaign.delete({ where: { id, userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
