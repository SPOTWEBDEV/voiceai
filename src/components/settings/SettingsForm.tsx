"use client";
import { useState } from "react";
import { Eye, EyeOff, Loader2, User, Bot, ExternalLink, Check } from "lucide-react";

interface UserSettings {
  name?: string | null;
  email?: string | null;
  openrouterKey?: string | null;
  openrouterModel?: string | null;
}

const FREE_MODELS = [
  { id: "meta-llama/llama-3.1-8b-instruct:free", label: "Llama 3.1 8B", desc: "Fast · Great for conversation" },
  { id: "meta-llama/llama-3.2-3b-instruct:free", label: "Llama 3.2 3B", desc: "Very fast · Lightweight" },
  { id: "mistralai/mistral-7b-instruct:free", label: "Mistral 7B", desc: "Reliable · Good quality" },
  { id: "google/gemma-2-9b-it:free", label: "Gemma 2 9B", desc: "Google model · Very capable" },
  { id: "microsoft/phi-3-mini-128k-instruct:free", label: "Phi-3 Mini", desc: "Microsoft · Long context" },
  { id: "nousresearch/hermes-3-llama-3.1-405b:free", label: "Hermes 3 405B", desc: "Most capable free model" },
  { id: "qwen/qwen-2-7b-instruct:free", label: "Qwen 2 7B", desc: "Alibaba · Multilingual" },
];

function Section({ title, icon: Icon, desc, children }: { title: string; icon: any; desc?: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-xl bg-card">
      <div className="p-5 border-b flex items-center gap-2">
        <Icon size={18} className="text-muted-foreground" />
        <span className="font-semibold text-sm">{title}</span>
      </div>
      {desc && <p className="px-5 pt-4 text-xs text-muted-foreground">{desc}</p>}
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

const inputClass = "w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-60";

export default function SettingsForm({ user }: { user: UserSettings }) {
  const [name, setName] = useState(user?.name || "");
  const [openrouterKey, setOpenrouterKey] = useState(user?.openrouterKey || "");
  const [openrouterModel, setOpenrouterModel] = useState(user?.openrouterModel || "meta-llama/llama-3.1-8b-instruct:free");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, openrouterKey, openrouterModel }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

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

      <Section title="OpenRouter AI — Free" icon={Bot} desc="OpenRouter gives free access to powerful AI models. Your key overrides the platform default.">
        <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-violet-700 dark:text-violet-400">How to get your free API key</p>
          <ol className="text-xs text-violet-600 dark:text-violet-400 space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="underline font-medium">openrouter.ai/keys</a></li>
            <li>Sign up free with Google or GitHub</li>
            <li>Click &ldquo;Create Key&rdquo; and paste it below</li>
            <li>All free models work immediately — no credit card needed</li>
          </ol>
          <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-violet-700 dark:text-violet-400 hover:underline">
            Open OpenRouter <ExternalLink size={11} />
          </a>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">API Key</label>
          <div className="relative">
            <input
              value={openrouterKey}
              onChange={(e) => setOpenrouterKey(e.target.value)}
              type={showKey ? "text" : "password"}
              placeholder="sk-or-v1-..."
              className={`${inputClass} pr-10`}
            />
            <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {openrouterKey && !openrouterKey.startsWith("sk-or-") && (
            <p className="text-xs text-amber-600">OpenRouter keys start with &ldquo;sk-or-&rdquo;</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">AI Model</label>
          <div className="grid gap-2">
            {FREE_MODELS.map((m) => (
              <label key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${openrouterModel === m.id ? "border-primary bg-primary/5" : "border-input hover:bg-muted/30"}`}>
                <input type="radio" name="model" value={m.id} checked={openrouterModel === m.id} onChange={() => setOpenrouterModel(m.id)} className="sr-only" />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${openrouterModel === m.id ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
                  {openrouterModel === m.id && <Check size={10} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">Free</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">More at <a href="https://openrouter.ai/models?q=:free" target="_blank" rel="noreferrer" className="underline">openrouter.ai/models</a></p>
        </div>
      </Section>

      <Section title="Notification Preferences" icon={User}>
        {[
          { label: "Campaign completed", desc: "When a campaign finishes all calls" },
          { label: "New interested lead", desc: "When a contact is marked interested" },
          { label: "Callback requested", desc: "When a contact requests a callback" },
        ].map(({ label, desc }) => (
          <div key={label} className="flex items-center justify-between py-1">
            <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>
        ))}
      </Section>

      <button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
        {saving && <Loader2 size={15} className="animate-spin" />}
        {saved ? "✓ Changes saved!" : saving ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
