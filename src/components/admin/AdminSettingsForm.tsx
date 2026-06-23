"use client";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Bot, Phone, Info, ExternalLink, Check } from "lucide-react";

const FREE_MODELS = [
  { id: "meta-llama/llama-3.1-8b-instruct:free", label: "Llama 3.1 8B Instruct", desc: "Fast, great for conversation" },
  { id: "meta-llama/llama-3.2-3b-instruct:free", label: "Llama 3.2 3B Instruct", desc: "Very fast, lightweight" },
  { id: "mistralai/mistral-7b-instruct:free", label: "Mistral 7B Instruct", desc: "Reliable, good quality" },
  { id: "google/gemma-2-9b-it:free", label: "Gemma 2 9B IT", desc: "Google model, very capable" },
  { id: "nousresearch/hermes-3-llama-3.1-405b:free", label: "Hermes 3 405B", desc: "Most capable free model" },
  { id: "qwen/qwen-2-7b-instruct:free", label: "Qwen 2 7B", desc: "Multilingual, strong" },
];

function Section({ title, icon: Icon, desc, children }: { title: string; icon: any; desc?: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-xl bg-card">
      <div className="p-5 border-b flex items-center gap-2">
        <Icon size={18} className="text-muted-foreground" />
        <span className="font-semibold text-sm">{title}</span>
      </div>
      {desc && (
        <div className="px-5 pt-4 flex items-start gap-2 text-xs text-muted-foreground">
          <Info size={13} className="mt-0.5 shrink-0" /><p>{desc}</p>
        </div>
      )}
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

const inputClass = "w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors";

export default function AdminSettingsForm() {
  const [showTokens, setShowTokens] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [openrouterModel, setOpenrouterModel] = useState("meta-llama/llama-3.1-8b-instruct:free");
  const [twilioSid, setTwilioSid] = useState("");
  const [twilioToken, setTwilioToken] = useState("");
  const [twilioPhone, setTwilioPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ openrouterKey, openrouterModel, twilioSid, twilioToken, twilioPhone }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleBtn = (
    <button type="button" onClick={() => setShowTokens(!showTokens)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
      {showTokens ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section
        title="OpenRouter AI (Platform Default)"
        icon={Bot}
        desc="Used for all users who haven't set their own key. Users can override this in their own settings."
      >
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-1">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Free API — No credit card required</p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Get a free key at{" "}
            <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="underline font-medium">
              openrouter.ai/keys
            </a>{" "}
            — sign up with Google or GitHub.
          </p>
          <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-700 dark:text-blue-400 hover:underline font-medium">
            Get API Key <ExternalLink size={10} />
          </a>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">OpenRouter API Key</label>
          <div className="relative">
            <input value={openrouterKey} onChange={(e) => setOpenrouterKey(e.target.value)} type={showTokens ? "text" : "password"} placeholder="sk-or-v1-..." className={`${inputClass} pr-10`} />
            {toggleBtn}
          </div>
          <p className="text-xs text-muted-foreground">Also set <code className="font-mono bg-muted px-1 rounded">OPENROUTER_API_KEY</code> in .env.local as a secure fallback.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Default Model</label>
          <div className="grid gap-2">
            {FREE_MODELS.map((m) => (
              <label key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${openrouterModel === m.id ? "border-primary bg-primary/5" : "border-input hover:bg-muted/30"}`}>
                <input type="radio" name="adminModel" value={m.id} checked={openrouterModel === m.id} onChange={() => setOpenrouterModel(m.id)} className="sr-only" />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${openrouterModel === m.id ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
                  {openrouterModel === m.id && <Check size={10} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full font-medium shrink-0">Free</span>
              </label>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Twilio (Platform Default)" icon={Phone} desc="Platform-wide Twilio credentials for making phone calls.">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Account SID</label>
          <input value={twilioSid} onChange={(e) => setTwilioSid(e.target.value)} placeholder="AC..." className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Auth Token</label>
          <div className="relative">
            <input value={twilioToken} onChange={(e) => setTwilioToken(e.target.value)} type={showTokens ? "text" : "password"} placeholder="Your auth token" className={`${inputClass} pr-10`} />
            {toggleBtn}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Phone Number</label>
          <input value={twilioPhone} onChange={(e) => setTwilioPhone(e.target.value)} placeholder="+1..." className={inputClass} />
          <p className="text-xs text-muted-foreground">Must be a Twilio number with Voice capabilities. Set <code className="font-mono bg-muted px-1 rounded">TWILIO_*</code> env vars as secure fallbacks.</p>
        </div>
      </Section>

      <div className="border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 rounded-xl p-4 text-xs text-amber-700 dark:text-amber-400">
        <p className="font-semibold mb-1">Best practice: use environment variables</p>
        <p>Set credentials in <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">.env.local</code> so they are never exposed in the database. UI values here override env vars at runtime.</p>
      </div>

      <button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
        {saving && <Loader2 size={15} className="animate-spin" />}
        {saved ? "✓ Settings saved!" : saving ? "Saving…" : "Save Platform Settings"}
      </button>
    </form>
  );
}
