import twilio from "twilio";

export function getTwilioClient(accountSid?: string, authToken?: string) {
  return twilio(accountSid || process.env.TWILIO_ACCOUNT_SID!, authToken || process.env.TWILIO_AUTH_TOKEN!);
}

export function getPhoneNumber(userPhone?: string) {
  return userPhone || process.env.TWILIO_PHONE_NUMBER!;
}

export async function initiateCall({
  to, from, callbackUrl, accountSid, authToken,
}: { to: string; from: string; callbackUrl: string; accountSid?: string; authToken?: string }) {
  const client = getTwilioClient(accountSid, authToken);
  return client.calls.create({
    to,
    from,
    url: callbackUrl,
    statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/status`,
    statusCallbackMethod: "POST",
    record: true,
  });
}
