import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initiateCall } from "@/lib/africastalking";
import { sendSMS, sendEmail, applyTemplate } from "@/lib/messaging";

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
      contactGroups: { include: { contactGroup: { select: { id: true, name: true, _count: { select: { contacts: true } } } } } },
      calls: { include: { contact: true } },
      messages: { include: { contact: true } },
    },
  });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(campaign);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (action === "start") {
    const campaign = await prisma.campaign.findFirst({
      where: { id, userId: session.user.id },
      include: {
        contactGroups: {
          include: { contactGroup: { include: { contacts: { where: { status: "PENDING" } } } } },
        },
      },
    });

    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    if (campaign.contactGroups.length === 0) {
      return NextResponse.json({ error: "No contact groups assigned. Edit the campaign and select at least one contact group." }, { status: 400 });
    }

    const allContacts = campaign.contactGroups.flatMap((cg) =>
      cg.contactGroup.contacts.map((c) => ({ id: c.id, phone: c.phone, name: c.name, email: c.email, company: c.company }))
    );

    if (allContacts.length === 0) {
      return NextResponse.json({ error: "No pending contacts found in any assigned group. All contacts may have already been called." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { smtpHost: true, smtpPort: true, smtpUser: true, smtpPass: true, smtpFrom: true },
    });

    const atApiKey = process.env.AT_API_KEY;
    const atUsername = process.env.AT_USERNAME;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    let successCount = 0;
    let failCount = 0;
    const results: any[] = [];

    // ── CALL campaign via Africa's Talking ─────────────────────────────────────
    if (campaign.channelType === "CALL") {
      if (!atApiKey) return NextResponse.json({ error: "AT_API_KEY not set. Add your Africa's Talking API key to .env.local" }, { status: 400 });
      if (!atUsername) return NextResponse.json({ error: "AT_USERNAME not set. Add your Africa's Talking username to .env.local" }, { status: 400 });

      for (const contact of allContacts) {
        let callId: string | null = null;
        try {
          const call = await prisma.call.create({
            data: { userId: session.user.id, contactId: contact.id, campaignId: campaign.id, status: "QUEUED" },
          });
          callId = call.id;

          const result = await initiateCall({
            to: contact.phone,
            callbackUrl: `${appUrl}/api/at/voice?callId=${call.id}`,
            apiKey: atApiKey,
            username: atUsername,
          });

          await prisma.call.update({
            where: { id: call.id },
            data: { twilioSid: result.sessionId, status: "RINGING", startedAt: new Date() },
          });
          await prisma.contact.update({ where: { id: contact.id }, data: { status: "CALLED" } });

          results.push({ contactId: contact.id, callId: call.id, sessionId: result.sessionId });
          successCount++;
        } catch (err: any) {
          const errMsg = err?.message || "Call failed";
          if (callId) await prisma.call.update({ where: { id: callId }, data: { status: "FAILED", errorMessage: errMsg } });
          results.push({ contactId: contact.id, error: errMsg });
          failCount++;
        }
      }
    }

    // ── SMS campaign via Africa's Talking ──────────────────────────────────────
    else if (campaign.channelType === "SMS") {
      if (!atApiKey) return NextResponse.json({ error: "AT_API_KEY not set. Add your Africa's Talking API key to .env.local" }, { status: 400 });
      if (!atUsername) return NextResponse.json({ error: "AT_USERNAME not set. Add your Africa's Talking username to .env.local" }, { status: 400 });
      if (!campaign.smsBody?.trim()) return NextResponse.json({ error: "SMS message body is empty. Edit the campaign and add a message." }, { status: 400 });

      for (const contact of allContacts) {
        try {
          const body = applyTemplate(campaign.smsBody!, contact);
          const result = await sendSMS({ to: contact.phone, body, apiKey: atApiKey, username: atUsername });
          await prisma.message.create({
            data: { userId: session.user.id, contactId: contact.id, campaignId: campaign.id, type: "SMS", status: "SENT", to: contact.phone, sentAt: new Date() },
          });
          await prisma.contact.update({ where: { id: contact.id }, data: { status: "MESSAGED" } });
          results.push({ contactId: contact.id, messageId: result.messageId });
          successCount++;
        } catch (err: any) {
          const errMsg = err?.message || "SMS send failed";
          await prisma.message.create({
            data: { userId: session.user.id, contactId: contact.id, campaignId: campaign.id, type: "SMS", status: "FAILED", to: contact.phone, errorMessage: errMsg },
          });
          results.push({ contactId: contact.id, error: errMsg });
          failCount++;
        }
      }
    }

    // ── EMAIL campaign via SMTP ────────────────────────────────────────────────
    else if (campaign.channelType === "EMAIL") {
      const smtpHost = user?.smtpHost || process.env.SMTP_HOST;
      const smtpPort = user?.smtpPort || parseInt(process.env.SMTP_PORT || "587");
      const smtpUser = user?.smtpUser || process.env.SMTP_USER;
      const smtpPass = user?.smtpPass || process.env.SMTP_PASS;
      const smtpFrom = user?.smtpFrom || process.env.EMAIL_FROM;

      if (!smtpHost) return NextResponse.json({ error: "SMTP host not configured. Add SMTP settings in Settings page." }, { status: 400 });
      if (!smtpUser) return NextResponse.json({ error: "SMTP username not configured. Add SMTP settings in Settings page." }, { status: 400 });
      if (!smtpPass) return NextResponse.json({ error: "SMTP password not configured. Add SMTP settings in Settings page." }, { status: 400 });
      if (!campaign.emailSubject?.trim()) return NextResponse.json({ error: "Email subject is empty. Edit the campaign." }, { status: 400 });
      if (!campaign.emailBodyHtml?.trim()) return NextResponse.json({ error: "Email body is empty. Edit the campaign." }, { status: 400 });

      const contactsWithEmail = allContacts.filter((c) => c.email);
      if (contactsWithEmail.length === 0) return NextResponse.json({ error: "None of the selected contacts have email addresses." }, { status: 400 });

      for (const contact of contactsWithEmail) {
        try {
          const subject = applyTemplate(campaign.emailSubject!, contact);
          const htmlBody = applyTemplate(campaign.emailBodyHtml!, contact);
          await sendEmail({ to: contact.email!, toName: contact.name, subject, htmlBody, smtpHost: smtpHost!, smtpPort: smtpPort!, smtpUser: smtpUser!, smtpPass: smtpPass!, smtpFrom: smtpFrom || smtpUser! });
          await prisma.message.create({
            data: { userId: session.user.id, contactId: contact.id, campaignId: campaign.id, type: "EMAIL", status: "SENT", to: contact.email!, sentAt: new Date() },
          });
          await prisma.contact.update({ where: { id: contact.id }, data: { status: "EMAILED" } });
          results.push({ contactId: contact.id, to: contact.email });
          successCount++;
        } catch (err: any) {
          const errMsg = err?.message || "Email send failed";
          await prisma.message.create({
            data: { userId: session.user.id, contactId: contact.id, campaignId: campaign.id, type: "EMAIL", status: "FAILED", to: contact.email!, errorMessage: errMsg },
          });
          results.push({ contactId: contact.id, error: errMsg });
          failCount++;
        }
      }
    }

    await prisma.campaign.update({ where: { id: campaign.id }, data: { status: successCount > 0 ? "ACTIVE" : "FAILED" } });

    if (successCount === 0) {
      const firstError = results.find((r) => r.error)?.error || "All sends failed";
      return NextResponse.json({ error: `All ${failCount} sends failed. Error: ${firstError}`, started: 0, failed: failCount }, { status: 400 });
    }

    const channelWord = campaign.channelType === "CALL" ? "calls" : campaign.channelType === "SMS" ? "SMS messages" : "emails";
    return NextResponse.json({
      started: successCount, failed: failCount, total: allContacts.length, results,
      message: `${successCount} ${channelWord} sent successfully${failCount > 0 ? `, ${failCount} failed` : ""}`,
    });
  }

  // Default: update status (pause/resume)
  const body = await req.json();
  const campaign = await prisma.campaign.update({ where: { id, userId: session.user.id }, data: { status: body.status } });
  return NextResponse.json(campaign);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, objective, channelType, script, systemPrompt, knowledgeBase, voice, smsBody, emailSubject, emailBodyHtml, emailBodyText, contactGroupIds } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });
  await prisma.campaignContactGroup.deleteMany({ where: { campaignId: id } });

  const campaign = await prisma.campaign.update({
    where: { id, userId: session.user.id },
    data: {
      name: name.trim(), objective: objective?.trim() || null, channelType: channelType || "CALL",
      script: script?.trim() || null, systemPrompt: systemPrompt?.trim() || null,
      knowledgeBase: knowledgeBase?.trim() || null, voice: voice || "alloy",
      smsBody: smsBody?.trim() || null, emailSubject: emailSubject?.trim() || null,
      emailBodyHtml: emailBodyHtml?.trim() || null, emailBodyText: emailBodyText?.trim() || null,
      contactGroups: contactGroupIds?.length > 0
        ? { create: contactGroupIds.map((cgId: string) => ({ contactGroupId: cgId })) }
        : undefined,
    },
    include: { contactGroups: { include: { contactGroup: { select: { id: true, name: true } } } } },
  });
  return NextResponse.json(campaign);
}

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
