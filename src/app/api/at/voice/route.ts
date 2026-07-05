import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAIResponse } from "@/lib/openrouter";
import { buildVoiceXml, buildGatherXml } from "@/lib/africastalking";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const callId = searchParams.get("callId");
  const formData = await req.formData();
  const dtmfDigits = formData.get("dtmfDigits") as string | null;
  const sessionId = formData.get("sessionId") as string;
  const isActive = formData.get("isActive") as string;

  // Call ended
  if (isActive === "0") {
    if (callId) {
      await prisma.call.update({ where: { id: callId }, data: { status: "COMPLETED", endedAt: new Date() } });
    }
    return new NextResponse("", { status: 200 });
  }

  const call = callId
    ? await prisma.call.findUnique({
        where: { id: callId },
        include: {
          campaign: { select: { script: true, systemPrompt: true, name: true, knowledgeBase: true } },
          transcripts: { orderBy: { timestamp: "asc" } },
          contact: { select: { name: true } },
          user: { select: { openrouterKey: true, openrouterModel: true } },
        },
      })
    : null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const gatherUrl = `${appUrl}/api/at/voice?callId=${callId}`;

  // First call - play opening script
  if (!dtmfDigits && call?.campaign?.script) {
    const greeting = call.campaign.script;
    if (callId) {
      await prisma.callTranscript.create({ data: { callId, role: "ai", content: greeting } });
      if (sessionId) await prisma.call.update({ where: { id: callId }, data: { twilioSid: sessionId, status: "IN_PROGRESS" } });
    }
    return new NextResponse(buildVoiceXml(greeting, gatherUrl), { headers: { "Content-Type": "text/xml" } });
  }

  // Subsequent - generate AI response
  if (call) {
    const userInput = dtmfDigits ? `User pressed: ${dtmfDigits}` : "(no input)";
    if (callId) await prisma.callTranscript.create({ data: { callId, role: "human", content: userInput } });

    const systemPrompt = call.campaign?.systemPrompt ||
      `You are a professional AI assistant calling ${call.contact?.name || "a contact"}. Be concise (under 50 words per response). Campaign: ${call.campaign?.name}.${call.campaign?.knowledgeBase ? `\nKnowledge: ${call.campaign.knowledgeBase}` : ""}`;

    const history = call.transcripts.map((t) => ({
      role: t.role === "ai" ? ("assistant" as const) : ("user" as const),
      content: t.content,
    }));

    const aiReply = await generateAIResponse({
      systemPrompt,
      conversationHistory: history,
      userMessage: userInput,
      apiKey: call.user?.openrouterKey || undefined,
      model: call.user?.openrouterModel || undefined,
    });

    if (callId) await prisma.callTranscript.create({ data: { callId, role: "ai", content: aiReply } });

    const isEnding = /goodbye|bye|thank you for your time|have a great day|take care/i.test(aiReply);
    if (isEnding && callId) {
      await prisma.call.update({ where: { id: callId }, data: { status: "COMPLETED", endedAt: new Date() } });
    }

    return new NextResponse(buildGatherXml(aiReply, gatherUrl, isEnding), { headers: { "Content-Type": "text/xml" } });
  }

  return new NextResponse(buildVoiceXml("Hello, thank you for answering. Goodbye.", gatherUrl), { headers: { "Content-Type": "text/xml" } });
}
