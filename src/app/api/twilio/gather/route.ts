import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAIResponse } from "@/lib/openrouter";
import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const callId = searchParams.get("callId")!;
  const formData = await req.formData();
  const speechResult = formData.get("SpeechResult") as string;

  const call = await prisma.call.findUnique({
    where: { id: callId },
    include: {
      campaign: { select: { systemPrompt: true, name: true, knowledgeBase: true } },
      transcripts: { orderBy: { timestamp: "asc" } },
      contact: { select: { name: true } },
      user: { select: { openrouterKey: true, openrouterModel: true } },
    },
  });

  if (!call) {
    const r = new VoiceResponse();
    r.hangup();
    return new NextResponse(r.toString(), { headers: { "Content-Type": "text/xml" } });
  }

  if (speechResult) {
    await prisma.callTranscript.create({ data: { callId, role: "human", content: speechResult } });
  }

  const systemPrompt =
    call.campaign?.systemPrompt ||
    `You are a professional AI assistant making a business call to ${call.contact?.name || "a contact"}.
Be concise (under 50 words per response), professional, and conversational.
Campaign: ${call.campaign?.name}
${call.campaign?.knowledgeBase ? `\nKnowledge base:\n${call.campaign.knowledgeBase}` : ""}
If the person wants to end the call, thank them and say goodbye.`;

  const history = call.transcripts.map((t) => ({
    role: t.role === "ai" ? ("assistant" as const) : ("user" as const),
    content: t.content,
  }));

  const aiReply = await generateAIResponse({
    systemPrompt,
    conversationHistory: history,
    userMessage: speechResult || "(no response detected)",
    apiKey: call.user?.openrouterKey || undefined,
    model: call.user?.openrouterModel || undefined,
  });

  await prisma.callTranscript.create({ data: { callId, role: "ai", content: aiReply } });

  const response = new VoiceResponse();
  const isEnding = /goodbye|bye|thank you for your time|have a great day|take care/i.test(aiReply);

  if (isEnding) {
    response.say({ voice: "Polly.Joanna" as any }, aiReply);
    response.hangup();
  } else {
    const gather = response.gather({
      input: ["speech"] as any,
      action: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/gather?callId=${callId}`,
      method: "POST",
      speechTimeout: "auto",
    });
    gather.say({ voice: "Polly.Joanna" as any }, aiReply);
  }

  return new NextResponse(response.toString(), { headers: { "Content-Type": "text/xml" } });
}
