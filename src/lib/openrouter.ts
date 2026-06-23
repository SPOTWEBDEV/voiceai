/**
 * OpenRouter client — drop-in replacement for OpenAI
 * OpenRouter uses the same API format as OpenAI (it's compatible)
 * Base URL: https://openrouter.ai/api/v1
 *
 * Free models available:
 *  - meta-llama/llama-3.1-8b-instruct:free
 *  - mistralai/mistral-7b-instruct:free
 *  - google/gemma-2-9b-it:free
 *  - nousresearch/hermes-3-llama-3.1-405b:free
 *  - microsoft/phi-3-mini-128k-instruct:free
 */

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

// Default free model — change in .env to override
export const DEFAULT_MODEL =
  process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free";

function getApiKey(userKey?: string): string {
  return userKey || process.env.OPENROUTER_API_KEY || "";
}

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  model?: string;
  messages: Message[];
  maxTokens?: number;
  temperature?: number;
  responseFormat?: "json" | "text";
  apiKey?: string;
}

async function chatCompletion(opts: ChatOptions): Promise<string> {
  const apiKey = getApiKey(opts.apiKey);
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  const body: any = {
    model: opts.model || DEFAULT_MODEL,
    messages: opts.messages,
    max_tokens: opts.maxTokens || 500,
    temperature: opts.temperature ?? 0.7,
  };

  // JSON mode — ask model to respond as JSON
  if (opts.responseFormat === "json") {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "VoiceAI Platform",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// ─── AI Conversation (used during live calls) ─────────────────────────────────
export async function generateAIResponse({
  systemPrompt,
  conversationHistory,
  userMessage,
  apiKey,
  model,
}: {
  systemPrompt: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
  userMessage: string;
  apiKey?: string;
  model?: string;
}): Promise<string> {
  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  try {
    const reply = await chatCompletion({
      model,
      messages,
      maxTokens: 300,
      temperature: 0.7,
      apiKey,
    });
    return reply.trim() || "I understand. Could you tell me more about that?";
  } catch (err) {
    console.error("OpenRouter generateAIResponse error:", err);
    return "I apologize, I'm having trouble processing that. Could you repeat that?";
  }
}

// ─── Call Summary (used after call ends) ──────────────────────────────────────
export async function generateCallSummary({
  transcript,
  apiKey,
  model,
}: {
  transcript: string;
  apiKey?: string;
  model?: string;
}): Promise<{
  summary: string;
  sentiment: string;
  outcome: string;
  followUp: string;
}> {
  const messages: Message[] = [
    {
      role: "system",
      content: `You are a call analyst. Analyze this call transcript and return a JSON object with exactly these keys:
- "summary": 2-3 sentence summary of the conversation
- "sentiment": one of "positive", "neutral", or "negative"
- "outcome": one of "interested", "not_interested", "callback", "voicemail", "no_answer"
- "followUp": a short recommended next action (1 sentence)

Return ONLY the raw JSON object, no markdown, no backticks, no explanation.`,
    },
    { role: "user", content: transcript },
  ];

  try {
    const raw = await chatCompletion({
      model,
      messages,
      maxTokens: 400,
      temperature: 0.3,
      responseFormat: "json",
      apiKey,
    });

    // Strip markdown fences if model ignores instructions
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);

    return {
      summary: result.summary || "Call completed.",
      sentiment: ["positive", "neutral", "negative"].includes(result.sentiment)
        ? result.sentiment
        : "neutral",
      outcome: ["interested", "not_interested", "callback", "voicemail", "no_answer"].includes(result.outcome)
        ? result.outcome
        : "no_answer",
      followUp: result.followUp || "No follow-up needed.",
    };
  } catch (err) {
    console.error("OpenRouter generateCallSummary error:", err);
    return { summary: "Summary unavailable.", sentiment: "neutral", outcome: "no_answer", followUp: "" };
  }
}

// ─── List available free models from OpenRouter ───────────────────────────────
export async function listFreeModels(apiKey?: string): Promise<{ id: string; name: string }[]> {
  const key = getApiKey(apiKey);
  if (!key) return [];

  try {
    const res = await fetch(`${OPENROUTER_BASE}/models`, {
      headers: { "Authorization": `Bearer ${key}` },
    });
    const data = await res.json();
    return (data.data || [])
      .filter((m: any) => m.id.endsWith(":free"))
      .map((m: any) => ({ id: m.id, name: m.name || m.id }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}
