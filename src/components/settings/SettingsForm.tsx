"use client";
import { useState } from "react";
import { Eye, EyeOff, Loader2, User, Bot, ExternalLink, Check, Mail, Phone, AlertCircle } from "lucide-react";

interface UserSettings {
  name?: string | null;
  email?: string | null;
  openrouterModel?: string | null;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUser?: string | null;
  smtpPass?: string | null;
  smtpFrom?: string | null;
}

const FREE_MODELS = [
  { id: "meta-llama/llama-3.1-8b-instruct:free", label: "Llama 3.1 8B", desc: "Fast · Great for conversation" },
  { id: "meta-llama/llama-3.2-3b-instruct:free", label: "Llama 3.2 3B", desc: "Very fast · Lightweight" },
  { id: "mistralai/mistral-7b-instruct:free", label: "Mistral 7B", desc: "Reliable · Good quality" },
  { id: "google/gemma-2-9b-it:free", label: "Gemma 2 9B", desc: "Google · Very capable" },
  { id: "microsoft/phi-3-mini-128k-instruct:free", label: "Phi-3 Mini", desc: "Microsoft · Long context" },
  { id: "nousresearch/hermes-3-llama-3.1-405b:free", label: "Hermes 3 405B", desc: "Most capable free model" },
  { id: "qwen/qwen-2-7b-instruct:free", label: "Qwen 2 7B", desc: "Alibaba · Multilingual" },
];

function Section({ title, icon: Icon, desc, children }: {
  title: string; icon: any; desc?: string; children: React.ReactNode;
}) {
  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <div className="p-4 sm:p-5 border-b flex items-center gap-2">
        <Icon size={18} className="text-muted-foreground shrink-0" />
        <span className="font-semibold text-sm">{title}</span>
      </div>
      {desc && <p className="px-4 sm:px-5 pt-4 text-xs text-muted-foreground">{desc}</p>}
      <div className="p-4 sm:p-5 space-y-4">{children}</div>
    </div>
  );
}

const inputClass = "w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-60";

export default function SettingsForm({ user }: { user: UserSettings }) {
  const [name, setName] = useState(user?.name || "");
  const [openrouterModel, setOpenrouterModel] = useState(user?.openrouterModel || "meta-llama/llama-3.1-8b-instruct:free");
  const [smtpHost, setSmtpHost] = useState(user?.smtpHost || "");
  const [smtpPort, setSmtpPort] = useState(String(user?.smtpPort || "587"));
  const [smtpUser, setSmtpUser] = useState(user?.smtpUser || "");
  const [smtpPass, setSmtpPass] = useState(user?.smtpPass || "");
  const [smtpFrom, setSmtpFrom] = useState(user?.smtpFrom || "");
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, openrouterModel,
          smtpHost: smtpHost || null,
          smtpPort: smtpPort ? parseInt(smtpPort) : null,
          smtpUser: smtpUser || null,
          smtpPass: smtpPass || null,
          smtpFrom: smtpFrom || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { setError("Failed to save. Please try again."); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />{error}
        </div>
      )}

      {/* Profile */}
      <Section title="Profile" icon={User}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Display Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email Address</label>
          <input value={user?.email || ""} disabled className={inputClass} />
          <p className="text-xs text-muted-foreground">Email cannot be changed after registration.</p>
        </div>
      </Section>

      {/* AI Model - no API key field */}
      <Section title="AI Model for Voice Calls" icon={Bot} desc="Select which free AI model powers your voice call conversations. All models are free via OpenRouter — configured by your admin.">
        <div className="space-y-2">
          {FREE_MODELS.map((m) => (
            <label key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${openrouterModel === m.id ? "border-primary bg-primary/5" : "border-input hover:bg-muted/30"}`}>
              <input type="radio" name="model" value={m.id} checked={openrouterModel === m.id} onChange={() => setOpenrouterModel(m.id)} className="sr-only" />
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${openrouterModel === m.id ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
                {openrouterModel === m.id && <Check size={10} className="text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
              </div>
              <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full font-medium shrink-0">Free</span>
            </label>
          ))}
        </div>
      </Section>

      {/* SMTP Email */}
      <Section title="Email (SMTP)" icon={Mail} desc="Required for Email campaigns. Configure your outgoing email server.">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-400 space-y-1">
          <p className="font-semibold">Quick setup:</p>
          <p>• <strong>Gmail:</strong> smtp.gmail.com · Port 587 · Use an <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="underline">App Password</a></p>
          <p>• <strong>Outlook:</strong> smtp-mail.outlook.com · Port 587</p>
          <p>• <strong>Resend / SendGrid</strong> for bulk sending</p>
        </div>

        {/* Responsive grid: 1 col on mobile, 2 on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">SMTP Host</label>
            <input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Port</label>
            <input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" type="number" className={inputClass} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">SMTP Username / Email</label>
          <input value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="you@gmail.com" type="email" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">SMTP Password</label>
          <div className="relative">
            <input value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} type={showSmtpPass ? "text" : "password"} placeholder="App password or SMTP password" className={`${inputClass} pr-10`} />
            <button type="button" onClick={() => setShowSmtpPass(!showSmtpPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showSmtpPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">From Address</label>
          <input value={smtpFrom} onChange={(e) => setSmtpFrom(e.target.value)} placeholder='Your Name <you@gmail.com>' className={inputClass} />
          <p className="text-xs text-muted-foreground">How recipients see the sender name.</p>
        </div>
      </Section>

      {/* SMS & Voice note */}
      <Section title="SMS & Voice Calls (Africa's Talking)" icon={Phone} desc="SMS and Voice campaigns use Africa's Talking — works globally, no upgrade required.">
        <div className="bg-muted rounded-xl p-4 text-xs text-muted-foreground space-y-1.5 font-mono overflow-x-auto">
          <p className="font-sans font-semibold text-foreground text-sm mb-2">Add to your .env.local file:</p>
          <p>AT_API_KEY=&quot;your-api-key&quot;</p>
          <p>AT_USERNAME=&quot;your-username&quot;</p>
          <p>AT_PHONE_NUMBER=&quot;+2547...&quot;  <span className="font-sans text-muted-foreground/70"># optional</span></p>
          <p>AT_SENDER_ID=&quot;YourBrand&quot;   <span className="font-sans text-muted-foreground/70"># optional SMS sender name</span></p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <a href="https://africastalking.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
            Sign up at Africa&apos;s Talking <ExternalLink size={11} />
          </a>
          <span className="text-xs text-muted-foreground hidden sm:inline">·</span>
          <a href="https://developers.africastalking.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
            API Docs <ExternalLink size={11} />
          </a>
        </div>
      </Section>

      <button type="submit" disabled={saving}
        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
        {saving && <Loader2 size={15} className="animate-spin" />}
        {saved ? "✓ Changes saved!" : saving ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
