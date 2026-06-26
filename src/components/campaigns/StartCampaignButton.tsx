"use client";
import { useState } from "react";
import { Play, Loader2, AlertCircle, CheckCircle, Pause } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StartCampaignButton({
  campaignId,
  status = "DRAFT",
}: {
  campaignId: string;
  status?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const router = useRouter();

  const start = async () => {
    setLoading(true);
    setResult(null);
    try {
      // Use ?action=start on the same [id] route — avoids nested /start folder issues
      const res = await fetch(`/api/campaigns/${campaignId}?action=start`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setResult({ type: "error", msg: data.error || "Failed to start campaign" });
      } else {
        const msg = data.failed > 0
          ? `${data.started} calls started, ${data.failed} failed`
          : `${data.started} call${data.started !== 1 ? "s" : ""} queued successfully!`;
        setResult({ type: "success", msg });
        setTimeout(() => { setResult(null); router.refresh(); }, 3000);
      }
    } catch (err: any) {
      setResult({ type: "error", msg: "Network error — could not reach the server" });
    } finally {
      setLoading(false);
    }
  };

  const pause = async () => {
    setLoading(true);
    try {
      await fetch(`/api/campaigns/${campaignId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAUSED" }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  // Show result message
  if (result) {
    return (
      <div className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg border max-w-sm ${
        result.type === "success"
          ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
          : "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
      }`}>
        {result.type === "success"
          ? <CheckCircle size={13} className="mt-0.5 shrink-0" />
          : <AlertCircle size={13} className="mt-0.5 shrink-0" />
        }
        <span className="flex-1">{result.msg}</span>
        {result.type === "error" && (
          <button onClick={() => setResult(null)} className="underline whitespace-nowrap shrink-0 ml-1">
            Dismiss
          </button>
        )}
      </div>
    );
  }

  // Pause button for active campaigns
  if (status === "ACTIVE") {
    return (
      <button
        onClick={pause}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-sm bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-medium transition-all"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Pause size={14} />}
        {loading ? "Pausing…" : "Pause"}
      </button>
    );
  }

  // Start button
  return (
    <button
      onClick={start}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-sm bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground px-3 py-1.5 rounded-lg font-medium transition-all"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
      {loading ? "Starting…" : "Start"}
    </button>
  );
}
