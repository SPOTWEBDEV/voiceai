"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Phone, MessageSquare, Mail, Users, FileText, Brain, Mic, Zap, Loader2, AlertCircle, Check } from "lucide-react";

type ChannelType = "CALL" | "SMS" | "EMAIL";

const CHANNEL_OPTIONS: { type: ChannelType; icon: any; label: string; desc: string; color: string }[] = [
  { type: "CALL", icon: Phone, label: "Voice Call", desc: "AI calls each contact and has a live conversation", color: "text-violet-600" },
  { type: "SMS", icon: MessageSquare, label: "SMS", desc: "Send a text message to each contact's phone", color: "text-green-600" },
  { type: "EMAIL", icon: Mail, label: "Email", desc: "Send a personalized email to each contact", color: "text-blue-600" },
];

const VOICES = [
  { value: "alloy", label: "Alloy — Neutral & balanced" },
  { value: "echo", label: "Echo — Warm & clear" },
  { value: "fable", label: "Fable — Expressive" },
  { value: "onyx", label: "Onyx — Deep & authoritative" },
  { value: "nova", label: "Nova — Friendly & energetic" },
  { value: "shimmer", label: "Shimmer — Bright & conversational" },
];

const CALL_TEMPLATES = [
  { label: "Sales", prompt: `You are Alex, a professional sales rep from [Company]. Call prospects to introduce our services.\nBe friendly and concise. Ask about their current challenges. If interested, collect their email and schedule a follow-up call.\nIf not interested, thank them for their time and end professionally.` },
  { label: "Recruiting", prompt: `You are Jordan, a recruiter from [Company]. Call candidates about a [Role] opportunity.\nBriefly describe the role and ask if they are open to new opportunities.\nCollect their preferred contact time for a detailed interview.` },
  { label: "Follow-up", prompt: `You are Sam from [Company] following up on a previous conversation.\nReference their earlier interest, ask if they have questions, and collect next steps.\nKeep the call under 3 minutes.` },
];

const SMS_TEMPLATES = [
  { label: "Promo", body: "Hi {{name}}, this is [Company]. We have an exclusive offer just for you! Reply YES to learn more or STOP to unsubscribe." },
  { label: "Follow-up", body: "Hi {{name}}, following up from [Company]. Did you get a chance to review our proposal? Reply here or call us at [Phone]." },
  { label: "Reminder", body: "Hi {{name}}, reminder: your appointment with [Company] is tomorrow. Reply CONFIRM to confirm or CANCEL to reschedule." },
];

const EMAIL_TEMPLATES = [
  {
    label: "Sales Intro",
    subject: "Quick intro from [Company] — for {{name}}",
    body: `<p>Hi {{name}},</p><p>I hope this email finds you well. My name is [Your Name] from [Company], and I'm reaching out because I believe we can help {{company}} with [specific problem].</p><p>We've helped similar companies achieve [result]. I'd love to schedule a quick 15-minute call to learn more about your needs.</p><p>Would this week or next work for you?</p><p>Best regards,<br>[Your Name]</p>`,
  },
  {
    label: "Follow-up",
    subject: "Following up — {{name}}",
    body: `<p>Hi {{name}},</p><p>I wanted to follow up on my previous message. I understand you're busy, so I'll keep this brief.</p><p>We help companies like {{company}} [achieve specific result]. I'd love just 10 minutes of your time.</p><p>Is there a good time this week?</p><p>Best,<br>[Your Name]</p>`,
  },
];

interface ContactGroup { id: string; name: string; description?: string | null; _count: { contacts: number }; }

interface Props {
  campaign?: {
    id: string; name: string; objective?: string | null; channelType: ChannelType;
    script?: string | null; systemPrompt?: string | null; knowledgeBase?: string | null; voice: string;
    smsBody?: string | null; emailSubject?: string | null; emailBodyHtml?: string | null;
    contactGroups: { contactGroup: { id: string; name: string } }[];
  };
}

const inputClass = "w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors";
const textareaClass = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-none";

function Section({ title, icon: Icon, desc, children }: { title: string; icon: any; desc?: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-xl bg-card">
      <div className="p-4 border-b flex items-center gap-2">
        <Icon size={17} className="text-muted-foreground" />
        <span className="font-semibold text-sm">{title}</span>
      </div>
      {desc && <p className="px-4 pt-3 text-xs text-muted-foreground">{desc}</p>}
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

export default function CreateCampaignForm({ campaign }: Props) {
  const router = useRouter();
  const isEdit = !!campaign;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(campaign?.name || "");
  const [objective, setObjective] = useState(campaign?.objective || "");
  const [channelType, setChannelType] = useState<ChannelType>(campaign?.channelType || "CALL");
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(campaign?.contactGroups.map((cg) => cg.contactGroup.id) || []);
  // CALL fields
  const [script, setScript] = useState(campaign?.script || "");
  const [systemPrompt, setSystemPrompt] = useState(campaign?.systemPrompt || "");
  const [knowledgeBase, setKnowledgeBase] = useState(campaign?.knowledgeBase || "");
  const [voice, setVoice] = useState(campaign?.voice || "alloy");
  // SMS fields
  const [smsBody, setSmsBody] = useState(campaign?.smsBody || "");
  // EMAIL fields
  const [emailSubject, setEmailSubject] = useState(campaign?.emailSubject || "");
  const [emailBodyHtml, setEmailBodyHtml] = useState(campaign?.emailBodyHtml || "");
  // Groups
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  useEffect(() => {
    fetch("/api/contact-groups").then((r) => r.json()).then((d) => { setGroups(Array.isArray(d) ? d : []); setLoadingGroups(false); }).catch(() => setLoadingGroups(false));
  }, []);

  const toggleGroup = (id: string) => setSelectedGroupIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const totalContacts = groups.filter((g) => selectedGroupIds.includes(g.id)).reduce((s, g) => s + g._count.contacts, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Campaign name is required."); return; }
    if (selectedGroupIds.length === 0) { setError("Please select at least one contact group."); return; }
    if (channelType === "CALL" && script.trim().length < 10) { setError("Opening script must be at least 10 characters."); return; }
    if (channelType === "CALL" && systemPrompt.trim().length < 20) { setError("AI instructions must be at least 20 characters."); return; }
    if (channelType === "SMS" && !smsBody.trim()) { setError("SMS message body is required."); return; }
    if (channelType === "EMAIL" && !emailSubject.trim()) { setError("Email subject is required."); return; }
    if (channelType === "EMAIL" && !emailBodyHtml.trim()) { setError("Email body is required."); return; }

    setLoading(true); setError("");
    try {
      const url = isEdit ? `/api/campaigns/${campaign!.id}` : "/api/campaigns";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, objective, channelType, contactGroupIds: selectedGroupIds, script, systemPrompt, knowledgeBase, voice, smsBody, emailSubject, emailBodyHtml }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push("/campaigns"); router.refresh();
    } catch (err: any) { setError(err.message || "Something went wrong."); setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />{error}
        </div>
      )}

      {/* Campaign name */}
      <Section title="Campaign Details" icon={FileText}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Campaign Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Q3 Outreach Campaign" className={inputClass} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Objective <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Qualify leads for the enterprise plan" className={inputClass} />
        </div>
      </Section>

      {/* Channel type selector */}
      <Section title="Campaign Channel" icon={Zap} desc="Choose how you want to reach your contacts.">
        <div className="grid grid-cols-3 gap-3">
          {CHANNEL_OPTIONS.map(({ type, icon: Icon, label, desc, color }) => (
            <button key={type} type="button" onClick={() => setChannelType(type)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${channelType === type ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-input hover:bg-muted/30"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${channelType === type ? "bg-primary/10" : "bg-muted"}`}>
                <Icon size={22} className={channelType === type ? color : "text-muted-foreground"} />
              </div>
              <span className={`text-sm font-semibold ${channelType === type ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
              <span className="text-xs text-muted-foreground leading-tight">{desc}</span>
              {channelType === type && <div className="w-2 h-2 rounded-full bg-primary mt-1" />}
            </button>
          ))}
        </div>
      </Section>

      {/* Contact groups */}
      <Section title="Contact Groups" icon={Users} desc="All contacts in selected groups will receive this campaign.">
        {loadingGroups ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 size={15} className="animate-spin" />Loading groups…</div>
        ) : groups.length === 0 ? (
          <div className="border-2 border-dashed rounded-xl p-6 text-center">
            <Users size={28} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">No contact groups yet</p>
            <p className="text-xs text-muted-foreground mt-1">Go to <a href="/contacts" className="text-primary underline">Contacts</a> and create a group first.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((g) => {
              const sel = selectedGroupIds.includes(g.id);
              return (
                <button key={g.id} type="button" onClick={() => toggleGroup(g.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${sel ? "border-primary bg-primary/5" : "border-input hover:bg-muted/30"}`}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${sel ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
                    {sel && <Check size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{g.name}</p>
                    {g.description && <p className="text-xs text-muted-foreground truncate">{g.description}</p>}
                  </div>
                  <span className="text-xs bg-muted px-2.5 py-1 rounded-full font-medium shrink-0">{g._count.contacts} contacts</span>
                </button>
              );
            })}
            {selectedGroupIds.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
                <Users size={13} /><span><strong>{totalContacts}</strong> contacts across <strong>{selectedGroupIds.length}</strong> group{selectedGroupIds.length !== 1 ? "s" : ""} will receive this campaign.</span>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* ── CALL fields ── */}
      {channelType === "CALL" && (<>
        <Section title="Opening Script" icon={Mic} desc="What the AI says at the very start of each call">
          <textarea value={script} onChange={(e) => setScript(e.target.value)} rows={3} placeholder="Hi, this is Alex calling from Acme Corp. I'm reaching out because…" className={textareaClass} />
          <p className="text-xs text-muted-foreground">Use <code className="bg-muted px-1 rounded">{"{{name}}"}</code> to personalize with contact name.</p>
        </Section>
        <Section title="AI Instructions" icon={Brain} desc="How the AI should behave throughout the conversation">
          <div className="flex flex-wrap gap-2">
            {CALL_TEMPLATES.map((t) => (
              <button key={t.label} type="button" onClick={() => setSystemPrompt(t.prompt)} className="text-xs border border-input rounded-full px-3 py-1 hover:bg-accent transition-colors">Use {t.label} template</button>
            ))}
          </div>
          <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={6} placeholder="You are a professional AI assistant. Your goal is to…" className={textareaClass} />
        </Section>
        <Section title="Knowledge Base" icon={FileText} desc="FAQs, pricing, product info the AI can reference (optional)">
          <textarea value={knowledgeBase} onChange={(e) => setKnowledgeBase(e.target.value)} rows={4} placeholder={"Pricing: $99/mo\nFAQ: Q: Free trial? A: Yes, 14 days"} className={textareaClass} />
        </Section>
        <Section title="AI Voice" icon={Zap}>
          <select value={voice} onChange={(e) => setVoice(e.target.value)} className={inputClass}>
            {VOICES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
          </select>
        </Section>
      </>)}

      {/* ── SMS fields ── */}
      {channelType === "SMS" && (
        <Section title="SMS Message" icon={MessageSquare} desc="The text message that will be sent to each contact.">
          <div className="flex flex-wrap gap-2 mb-2">
            {SMS_TEMPLATES.map((t) => (
              <button key={t.label} type="button" onClick={() => setSmsBody(t.body)} className="text-xs border border-input rounded-full px-3 py-1 hover:bg-accent transition-colors">Use {t.label} template</button>
            ))}
          </div>
          <textarea value={smsBody} onChange={(e) => setSmsBody(e.target.value)} rows={5}
            placeholder="Hi {{name}}, this is [Company]. We're reaching out because..."
            className={textareaClass} />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <p>Variables: <code className="bg-muted px-1 rounded">{"{{name}}"}</code> <code className="bg-muted px-1 rounded">{"{{email}}"}</code> <code className="bg-muted px-1 rounded">{"{{company}}"}</code> <code className="bg-muted px-1 rounded">{"{{phone}}"}</code></p>
            <span className={smsBody.length > 160 ? "text-amber-500" : ""}>{smsBody.length}/160 chars {smsBody.length > 160 ? `(${Math.ceil(smsBody.length / 160)} SMS)` : ""}</span>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs text-amber-700 dark:text-amber-400">
            <strong>Required:</strong> Add <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">TWILIO_ACCOUNT_SID</code>, <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">TWILIO_AUTH_TOKEN</code>, and <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">TWILIO_PHONE_NUMBER</code> to your .env.local to send SMS.
          </div>
        </Section>
      )}

      {/* ── EMAIL fields ── */}
      {channelType === "EMAIL" && (
        <Section title="Email Content" icon={Mail} desc="Compose the email that will be sent to each contact.">
          <div className="flex flex-wrap gap-2 mb-1">
            {EMAIL_TEMPLATES.map((t) => (
              <button key={t.label} type="button" onClick={() => { setEmailSubject(t.subject); setEmailBodyHtml(t.body); }} className="text-xs border border-input rounded-full px-3 py-1 hover:bg-accent transition-colors">Use {t.label} template</button>
            ))}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Subject *</label>
            <input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Quick intro from [Company] — for {{name}}" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email Body (HTML) *</label>
            <textarea value={emailBodyHtml} onChange={(e) => setEmailBodyHtml(e.target.value)} rows={10}
              placeholder={"<p>Hi {{name}},</p>\n<p>I hope this email finds you well...</p>\n<p>Best regards,<br>[Your Name]</p>"}
              className={`${textareaClass} font-mono text-xs`} />
            <p className="text-xs text-muted-foreground">Variables: <code className="bg-muted px-1 rounded">{"{{name}}"}</code> <code className="bg-muted px-1 rounded">{"{{email}}"}</code> <code className="bg-muted px-1 rounded">{"{{company}}"}</code> <code className="bg-muted px-1 rounded">{"{{phone}}"}</code></p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-400 space-y-1">
            <p><strong>Required in .env.local or Settings:</strong></p>
            <p><code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">SMTP_HOST</code>, <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">SMTP_PORT</code>, <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">SMTP_USER</code>, <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">SMTP_PASS</code></p>
            <p>Also make sure contacts have email addresses in their profiles.</p>
          </div>
        </Section>
      )}

      <button type="submit" disabled={loading || loadingGroups}
        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save Changes" : "Create Campaign")}
      </button>
    </form>
  );
}
