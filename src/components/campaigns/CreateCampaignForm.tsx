"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Brain, FileText, Zap, Loader2 } from "lucide-react";

const VOICES = [
  { value: "alloy", label: "Alloy — Neutral & balanced" },
  { value: "echo", label: "Echo — Warm & clear" },
  { value: "fable", label: "Fable — Expressive" },
  { value: "onyx", label: "Onyx — Deep & authoritative" },
  { value: "nova", label: "Nova — Friendly & energetic" },
  { value: "shimmer", label: "Shimmer — Bright & conversational" },
];

const TEMPLATES = [
  { label: "Sales", prompt: `You are Alex, a professional sales rep from [Company]. Call prospects to introduce our services.\nBe friendly and concise. Ask about their current challenges. If interested, collect their email and schedule a follow-up call.\nIf not interested, thank them for their time and end professionally.` },
  { label: "Recruiting", prompt: `You are Jordan, a recruiter from [Company]. Call candidates about a [Role] opportunity.\nBriefly describe the role. Ask if they're open to new opportunities. If yes, ask about their experience.\nCollect their preferred contact time for a detailed interview.` },
  { label: "Follow-up", prompt: `You are Sam from [Company] following up on a previous conversation.\nReference that they showed interest. Ask if they have any questions. If ready to move forward, collect next steps.\nKeep the call under 3 minutes and always confirm their best contact method.` },
];

const inputClass = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring";
const textareaClass = `${inputClass} resize-none`;

function Section({ title, icon: Icon, desc, children }: { title: string; icon: any; desc?: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-xl bg-card">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 font-medium text-sm"><Icon size={17} />{title}</div>
        {desc && <p className="text-xs text-muted-foreground mt-1">{desc}</p>}
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

export default function CreateCampaignForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("");
  const [script, setScript] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [voice, setVoice] = useState("alloy");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Campaign name is required."); return; }
    if (script.trim().length < 10) { setError("Opening script must be at least 10 characters."); return; }
    if (systemPrompt.trim().length < 20) { setError("AI instructions must be at least 20 characters."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, objective, script, systemPrompt, knowledgeBase, voice }),
      });
      if (!res.ok) throw new Error("Failed to create campaign");
      router.push("/campaigns");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      <Section title="Campaign Details" icon={FileText}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Campaign Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Q3 Sales Outreach" className={inputClass} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Objective <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Qualify leads for the enterprise plan" className={inputClass} />
        </div>
      </Section>

      <Section title="Opening Script" icon={Mic} desc="What the AI says at the very start of each call">
        <textarea value={script} onChange={(e) => setScript(e.target.value)} rows={3} placeholder="Hi, this is Alex calling from Acme Corp. I'm reaching out because…" className={textareaClass} required />
      </Section>

      <Section title="AI Instructions" icon={Brain} desc="How the AI should behave throughout the conversation">
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button key={t.label} type="button" onClick={() => setSystemPrompt(t.prompt)}
              className="text-xs border border-input rounded-full px-3 py-1 hover:bg-accent transition-colors">
              Use {t.label} template
            </button>
          ))}
        </div>
        <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={6} placeholder="You are a professional AI assistant. Your goal is to…" className={textareaClass} required />
      </Section>

      <Section title="Knowledge Base" icon={FileText} desc="FAQs, pricing, or product info the AI can reference mid-call (optional)">
        <textarea value={knowledgeBase} onChange={(e) => setKnowledgeBase(e.target.value)} rows={4}
          placeholder={"Pricing: $99/mo Starter, $299/mo Growth\nFAQ: Q: Free trial? A: Yes, 14 days…"}
          className={textareaClass} />
      </Section>

      <Section title="Voice" icon={Zap}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">AI Voice</label>
          <select value={voice} onChange={(e) => setVoice(e.target.value)} className={inputClass}>
            {VOICES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
          </select>
        </div>
      </Section>

      <button type="submit" disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? "Creating campaign…" : "Create Campaign"}
      </button>
    </form>
  );
}
