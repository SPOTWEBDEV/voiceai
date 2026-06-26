"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic, Brain, FileText, Zap, Loader2, Users, AlertCircle, Check } from "lucide-react";

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

interface ContactGroup {
  id: string;
  name: string;
  description?: string | null;
  _count: { contacts: number };
}

interface Props {
  // If provided, we're editing an existing campaign
  campaign?: {
    id: string;
    name: string;
    objective?: string | null;
    script?: string | null;
    systemPrompt?: string | null;
    knowledgeBase?: string | null;
    voice: string;
    contactGroups: { contactGroup: { id: string; name: string } }[];
  };
}

function Section({ title, icon: Icon, desc, required, children }: {
  title: string; icon: any; desc?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="border rounded-xl bg-card">
      <div className="p-4 border-b flex items-center gap-2">
        <Icon size={17} className="text-muted-foreground" />
        <span className="font-semibold text-sm">{title}</span>
        {required && <span className="text-xs text-destructive font-bold ml-1">*</span>}
      </div>
      {desc && <p className="px-4 pt-3 text-xs text-muted-foreground">{desc}</p>}
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

const inputClass = "w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors";
const textareaClass = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-none";

export default function CreateCampaignForm({ campaign }: Props) {
  const router = useRouter();
  const isEdit = !!campaign;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(campaign?.name || "");
  const [objective, setObjective] = useState(campaign?.objective || "");
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    campaign?.contactGroups.map((cg) => cg.contactGroup.id) || []
  );
  const [script, setScript] = useState(campaign?.script || "");
  const [systemPrompt, setSystemPrompt] = useState(campaign?.systemPrompt || "");
  const [knowledgeBase, setKnowledgeBase] = useState(campaign?.knowledgeBase || "");
  const [voice, setVoice] = useState(campaign?.voice || "alloy");
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  useEffect(() => {
    fetch("/api/contact-groups")
      .then((r) => r.json())
      .then((data) => { setGroups(Array.isArray(data) ? data : []); setLoadingGroups(false); })
      .catch(() => setLoadingGroups(false));
  }, []);

  const toggleGroup = (id: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const totalContacts = groups
    .filter((g) => selectedGroupIds.includes(g.id))
    .reduce((sum, g) => sum + g._count.contacts, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Campaign name is required."); return; }
    if (selectedGroupIds.length === 0) { setError("Please select at least one contact group."); return; }
    if (script.trim().length < 10) { setError("Opening script must be at least 10 characters."); return; }
    if (systemPrompt.trim().length < 20) { setError("AI instructions must be at least 20 characters."); return; }

    setLoading(true);
    setError("");
    try {
      const url = isEdit ? `/api/campaigns/${campaign!.id}` : "/api/campaigns";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, objective, contactGroupIds: selectedGroupIds, script, systemPrompt, knowledgeBase, voice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
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
        <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Campaign Details */}
      <Section title="Campaign Details" icon={FileText} required>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Campaign Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Q3 Sales Outreach" className={inputClass} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Objective <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Qualify leads for the enterprise plan" className={inputClass} />
        </div>
      </Section>

      {/* Contact Groups - multi-select */}
      <Section title="Contact Groups" icon={Users} required desc="Select one or more groups — all contacts in selected groups will be called when this campaign starts.">
        {loadingGroups ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 size={15} className="animate-spin" /> Loading your contact groups…
          </div>
        ) : groups.length === 0 ? (
          <div className="border-2 border-dashed rounded-xl p-6 text-center space-y-2">
            <Users size={28} className="mx-auto text-muted-foreground" />
            <p className="text-sm font-medium">No contact groups yet</p>
            <p className="text-xs text-muted-foreground">
              Go to the <a href="/contacts" className="text-primary underline">Contacts page</a> and create a group first.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((group) => {
              const selected = selectedGroupIds.includes(group.id);
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    selected
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-input hover:border-muted-foreground/40 hover:bg-muted/30"
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${
                    selected ? "border-primary bg-primary" : "border-muted-foreground/40"
                  }`}>
                    {selected && <Check size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{group.name}</p>
                    {group.description && <p className="text-xs text-muted-foreground truncate">{group.description}</p>}
                  </div>
                  <span className="text-xs bg-muted px-2.5 py-1 rounded-full font-medium shrink-0">
                    {group._count.contacts} contact{group._count.contacts !== 1 ? "s" : ""}
                  </span>
                </button>
              );
            })}

            {selectedGroupIds.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2 mt-2">
                <Users size={13} />
                <span>
                  <strong>{totalContacts}</strong> total contacts across{" "}
                  <strong>{selectedGroupIds.length}</strong> group{selectedGroupIds.length !== 1 ? "s" : ""} will be called.
                </span>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Opening Script */}
      <Section title="Opening Script" icon={Mic} required desc="What the AI says at the very start of each call">
        <textarea value={script} onChange={(e) => setScript(e.target.value)} rows={3} placeholder="Hi, this is Alex calling from Acme Corp. I'm reaching out because…" className={textareaClass} required />
      </Section>

      {/* AI Instructions */}
      <Section title="AI Instructions" icon={Brain} required desc="How the AI should behave throughout the conversation">
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button key={t.label} type="button" onClick={() => setSystemPrompt(t.prompt)}
              className="text-xs border border-input rounded-full px-3 py-1 hover:bg-accent transition-colors">
              Use {t.label} template
            </button>
          ))}
        </div>
        <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={6}
          placeholder="You are a professional AI assistant. Your goal is to…" className={textareaClass} required />
      </Section>

      {/* Knowledge Base */}
      <Section title="Knowledge Base" icon={FileText} desc="FAQs, pricing, or product info the AI can reference mid-call (optional)">
        <textarea value={knowledgeBase} onChange={(e) => setKnowledgeBase(e.target.value)} rows={4}
          placeholder={"Pricing: $99/mo Starter\nFAQ: Q: Free trial? A: Yes, 14 days…"} className={textareaClass} />
      </Section>

      {/* Voice */}
      <Section title="AI Voice" icon={Zap}>
        <select value={voice} onChange={(e) => setVoice(e.target.value)} className={inputClass}>
          {VOICES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
        </select>
      </Section>

      <button type="submit" disabled={loading || loadingGroups}
        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save Changes" : "Create Campaign")}
      </button>
    </form>
  );
}
