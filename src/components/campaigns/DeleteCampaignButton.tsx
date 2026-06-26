"use client";
import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteCampaignButton({
  campaignId,
  campaignName,
}: {
  campaignId: string;
  campaignName: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Delete campaign "${campaignName}"? This will also delete all call records for this campaign. This cannot be undone.`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete campaign");
      }
    } catch {
      alert("Network error — could not delete campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-sm border border-destructive/30 text-destructive hover:bg-destructive/10 disabled:opacity-50 px-3 py-1.5 rounded-lg font-medium transition-all"
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}
