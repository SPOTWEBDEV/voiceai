// Africa's Talking - works globally, no upgrade required, no geo-restrictions
// Supports: Voice Calls, SMS, USSD
// Sign up free: https://africastalking.com

import AfricasTalking from "africastalking";

export function getATClient(apiKey?: string, username?: string) {
  return AfricasTalking({
    apiKey: apiKey || process.env.AT_API_KEY!,
    username: username || process.env.AT_USERNAME!,
  });
}

// ── Initiate outbound voice call ───────────────────────────────────────────────
export async function initiateCall({
  to,
  callbackUrl,
  apiKey,
  username,
  from,
}: {
  to: string;
  callbackUrl: string;
  apiKey?: string;
  username?: string;
  from?: string;
}): Promise<{ callSessionState: string; sessionId: string; status: string }> {
  const at = getATClient(apiKey, username);
  const voice = at.VOICE;

  const result = await voice.call({
    callFrom: from || process.env.AT_PHONE_NUMBER || "+254711082345",
    callTo: [to],
  });

  return {
    callSessionState: result.entries?.[0]?.status || "Queued",
    sessionId: result.entries?.[0]?.sessionId || "",
    status: result.entries?.[0]?.status || "Queued",
  };
}

// ── Send SMS ───────────────────────────────────────────────────────────────────
export async function sendSMS({
  to,
  message,
  apiKey,
  username,
  from,
}: {
  to: string;
  message: string;
  apiKey?: string;
  username?: string;
  from?: string;
}): Promise<{ messageId: string; status: string; cost: string }> {
  const at = getATClient(apiKey, username);
  const sms = at.SMS;

  const result = await sms.send({
    to: [to],
    message,
    from: from || process.env.AT_SENDER_ID || undefined,
  });

  const entry = result.SMSMessageData?.Recipients?.[0];
  return {
    messageId: entry?.messageId || "",
    status: entry?.status || "Failed",
    cost: entry?.cost || "0",
  };
}

// ── Generate TwiML-like XML for AT voice calls ─────────────────────────────────
export function buildVoiceXml(script: string, gatherUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <GetDigits timeout="30" finishOnKey="#" callbackUrl="${gatherUrl}">
    <Say voice="en-US-Wavenet-F">${script}</Say>
  </GetDigits>
  <Say>We did not receive your response. Goodbye.</Say>
</Response>`;
}

export function buildGatherXml(aiReply: string, nextGatherUrl: string, isEnding: boolean): string {
  if (isEnding) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="en-US-Wavenet-F">${aiReply}</Say>
</Response>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <GetDigits timeout="30" finishOnKey="#" callbackUrl="${nextGatherUrl}">
    <Say voice="en-US-Wavenet-F">${aiReply}</Say>
  </GetDigits>
</Response>`;
}
