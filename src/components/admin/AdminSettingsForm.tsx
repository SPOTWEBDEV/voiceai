"use client";
import { useState } from "react";
import { Loader2, Info, ShieldCheck, Users, BarChart3 } from "lucide-react";

export default function AdminSettingsForm() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [appName, setAppName] = useState("VoiceAI");
  const [supportEmail, setSupportEmail] = useState("");
  const [maxCallsPerUser, setMaxCallsPerUser] = useState("1000");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simulate save - in production connect to a PlatformConfig table
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputClass = "w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors";

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
        <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <p className="font-semibold">API credentials are managed per-user</p>
          <p>Each user configures their own OpenRouter API key and selects their preferred free AI model in their Settings page. Twilio credentials are configured globally via environment variables.</p>
        </div>
      </div>

      {/* Platform stats cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Users", icon: Users, value: "—" },
          { label: "Total Campaigns", icon: BarChart3, value: "—" },
          { label: "Platform Status", icon: ShieldCheck, value: "Active" },
        ].map(({ label, icon: Icon, value }) => (
          <div key={label} className="border rounded-xl bg-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Platform config form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border rounded-xl bg-card">
          <div className="p-5 border-b">
            <span className="font-semibold text-sm">General Platform Settings</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Platform Name</label>
              <input
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="VoiceAI"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@yourplatform.com"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Default Call Limit Per User</label>
              <input
                type="number"
                value={maxCallsPerUser}
                onChange={(e) => setMaxCallsPerUser(e.target.value)}
                placeholder="1000"
                className={inputClass}
              />
              <p className="text-xs text-muted-foreground">Maximum calls a user can make per month on the free plan.</p>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">When enabled, only admins can access the platform.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>
          </div>
        </div>

        {/* Environment variables reminder */}
        <div className="border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 rounded-xl p-4 text-xs text-amber-700 dark:text-amber-400 space-y-2">
          <p className="font-semibold text-sm">Environment Variables (set in .env.local or Netlify)</p>
          <div className="grid grid-cols-1 gap-1 font-mono">
            {[
              "OPENROUTER_API_KEY   — platform default AI key",
              "OPENROUTER_MODEL     — default free model",
              "TWILIO_ACCOUNT_SID   — Twilio account",
              "TWILIO_AUTH_TOKEN    — Twilio auth",
              "TWILIO_PHONE_NUMBER  — outbound phone number",
              "NEXTAUTH_SECRET      — auth encryption secret",
              "DATABASE_URL         — database connection",
            ].map((v) => (
              <p key={v} className="bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded">
                {v}
              </p>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          {saved ? "✓ Settings saved!" : saving ? "Saving…" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
