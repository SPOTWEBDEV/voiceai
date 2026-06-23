import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCallSummary } from "@/lib/openrouter";

const statusMap: Record<string, string> = {
  completed: "COMPLETED", failed: "FAILED", "no-answer": "NO_ANSWER",
  busy: "BUSY", canceled: "CANCELED", "in-progress": "IN_PROGRESS", ringing: "RINGING",
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const callSid = formData.get("CallSid") as string;
  const callStatus = formData.get("CallStatus") as string;
  const duration = formData.get("CallDuration") as string;
  const recordingUrl = formData.get("RecordingUrl") as string;

  const call = await prisma.call.findFirst({ where: { twilioSid: callSid } });
  if (!call) return NextResponse.json({ ok: true });

  const updatedCall = await prisma.call.update({
    where: { id: call.id },
    data: {
      status: (statusMap[callStatus] || "FAILED") as any,
      duration: duration ? parseInt(duration) : null,
      recordingUrl: recordingUrl || null,
      endedAt: callStatus === "completed" ? new Date() : undefined,
    },
    include: {
      transcripts: { orderBy: { timestamp: "asc" } },
      user: { select: { openrouterKey: true, openrouterModel: true } },
    },
  });

  if (callStatus === "completed" && updatedCall.transcripts.length > 0) {
    const transcript = updatedCall.transcripts
      .map((t) => `${t.role === "ai" ? "AI" : "Contact"}: ${t.content}`)
      .join("\n");
    try {
      const { summary, sentiment, outcome, followUp } = await generateCallSummary({
        transcript,
        apiKey: updatedCall.user?.openrouterKey || undefined,
        model: updatedCall.user?.openrouterModel || undefined,
      });
      await prisma.call.update({ where: { id: call.id }, data: { summary, sentiment, outcome, followUp } });

      const contactStatus =
        outcome === "interested" ? "INTERESTED" :
        outcome === "callback" ? "CALLBACK" :
        outcome === "not_interested" ? "NOT_INTERESTED" : undefined;
      if (contactStatus) {
        await prisma.contact.update({ where: { id: updatedCall.contactId }, data: { status: contactStatus as any } });
      }
    } catch (err) {
      console.error("Failed to generate call summary:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
