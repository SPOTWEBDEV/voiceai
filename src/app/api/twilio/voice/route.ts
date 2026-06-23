import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const callId = searchParams.get("callId");
  const formData = await req.formData();
  const callSid = formData.get("CallSid") as string;

  const call = callId
    ? await prisma.call.findUnique({ where: { id: callId }, include: { campaign: true, contact: true } })
    : await prisma.call.findFirst({ where: { twilioSid: callSid }, include: { campaign: true, contact: true } });

  const response = new VoiceResponse();
  const greeting = call?.campaign?.script || `Hi, this is an AI assistant calling from ${call?.campaign?.name || "our company"}. How are you today?`;

  const gather = response.gather({
    input: ["speech"] as any,
    action: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/gather?callId=${call?.id}`,
    method: "POST",
    speechTimeout: "auto",
    language: "en-US",
  });
  gather.say({ voice: "Polly.Joanna" as any }, greeting);

  if (call?.id) {
    await prisma.callTranscript.create({ data: { callId: call.id, role: "ai", content: greeting } });
    if (callSid && !call.twilioSid) {
      await prisma.call.update({ where: { id: call.id }, data: { twilioSid: callSid } });
    }
  }

  return new NextResponse(response.toString(), { headers: { "Content-Type": "text/xml" } });
}
