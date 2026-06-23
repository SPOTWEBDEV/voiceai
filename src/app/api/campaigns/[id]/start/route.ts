import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initiateCall, getPhoneNumber } from "@/lib/twilio";

export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaign = await prisma.campaign.findFirst({
    where: { id, userId: session.user.id },
    include: {
      contactGroup: {
        include: { contacts: { where: { status: "PENDING" }, take: 10 } },
      },
    },
  });

  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  if (!campaign.contactGroupId) {
    return NextResponse.json(
      { error: "Campaign has no contact group assigned. Edit the campaign and select a contact group." },
      { status: 400 }
    );
  }

  const contacts = campaign.contactGroup?.contacts || [];
  if (contacts.length === 0) {
    return NextResponse.json({ error: "No pending contacts in the selected group." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twilioSid: true, twilioToken: true, twilioPhone: true },
  });

  const callResults = [];
  for (const contact of contacts) {
    try {
      const call = await prisma.call.create({
        data: { userId: session.user.id, contactId: contact.id, campaignId: campaign.id, status: "QUEUED" },
      });
      const twilioCall = await initiateCall({
        to: contact.phone,
        from: getPhoneNumber(user?.twilioPhone || undefined),
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/voice?callId=${call.id}`,
        accountSid: user?.twilioSid || undefined,
        authToken: user?.twilioToken || undefined,
      });
      await prisma.call.update({
        where: { id: call.id },
        data: { twilioSid: twilioCall.sid, status: "RINGING", startedAt: new Date() },
      });
      await prisma.contact.update({ where: { id: contact.id }, data: { status: "CALLED" } });
      callResults.push({ contactId: contact.id, callId: call.id, sid: twilioCall.sid });
    } catch (err) {
      console.error(`Failed to call ${contact.phone}:`, err);
    }
  }

  await prisma.campaign.update({ where: { id: campaign.id }, data: { status: "ACTIVE" } });
  return NextResponse.json({ started: callResults.length, calls: callResults });
}
