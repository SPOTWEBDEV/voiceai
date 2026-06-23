"use client";
import { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StartCampaignButton({ campaignId }: { campaignId: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const start = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/start`, { method: "POST" });
      const data = await res.json();
      setMsg(`${data.started} calls queued`);
      setTimeout(() => { setMsg(""); router.refresh(); }, 2000);
    } catch {
      setMsg("Failed to start");
    } finally {
      setLoading(false);
    }
  };

  if (msg) return <span className="text-xs text-muted-foreground px-3 py-1.5 border rounded-lg">{msg}</span>;

  return (
    <button onClick={start} disabled={loading} className="inline-flex items-center gap-1.5 text-sm bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground px-3 py-1.5 rounded-lg font-medium transition-all">
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
      {loading ? "Starting…" : "Start"}
    </button>
  );
}
