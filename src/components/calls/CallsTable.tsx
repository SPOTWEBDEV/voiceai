"use client";
import { useState } from "react";
import { Phone, Clock, MessageSquare, X } from "lucide-react";

const statusColors: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  NO_ANSWER: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  QUEUED: "bg-gray-100 text-gray-600 dark:bg-gray-800",
  RINGING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  BUSY: "bg-gray-100 text-gray-600",
  CANCELED: "bg-gray-100 text-gray-600",
};

const sentimentEmoji: Record<string, string> = {
  positive: "😊",
  neutral: "😐",
  negative: "😟",
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface Transcript {
  id: string;
  role: string;
  content: string;
  timestamp: string | Date;
}

interface Call {
  id: string;
  status: string;
  duration: number | null;
  summary: string | null;
  sentiment: string | null;
  outcome: string | null;
  followUp: string | null;
  createdAt: string | Date;
  contact: { name: string; phone: string };
  campaign: { name: string };
  transcripts: Transcript[];
}

function TranscriptModal({ call, onClose }: { call: Call; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-background border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b shrink-0">
          <div>
            <h2 className="font-semibold">{call.contact.name}</h2>
            <p className="text-xs text-muted-foreground">{call.campaign.name} · {call.contact.phone}</p>
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* AI Summary */}
        {call.summary && (
          <div className="p-4 border-b bg-muted/30 shrink-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">AI Summary</p>
            <p className="text-sm leading-relaxed">{call.summary}</p>
            <div className="flex items-center gap-3 mt-3 pt-2 border-t border-border/50">
              {call.sentiment && (
                <span className="text-xs text-muted-foreground">
                  {sentimentEmoji[call.sentiment]} {call.sentiment}
                </span>
              )}
              {call.outcome && (
                <span className="text-xs border rounded-full px-2 py-0.5 capitalize font-medium">
                  {call.outcome.replace(/_/g, " ")}
                </span>
              )}
              <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                <Clock size={11} /> {formatDuration(call.duration)}
              </span>
            </div>
            {call.followUp && (
              <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                <span className="font-medium">Suggested next step:</span> {call.followUp}
              </p>
            )}
          </div>
        )}

        {/* Transcript */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {call.transcripts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No transcript available for this call</p>
            </div>
          ) : (
            call.transcripts.map((t) => (
              <div key={t.id} className={`flex gap-3 ${t.role === "ai" ? "" : "flex-row-reverse"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  t.role === "ai"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground border"
                }`}>
                  {t.role === "ai" ? "AI" : "C"}
                </div>
                <div className={`max-w-[78%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  t.role === "ai" ? "bg-muted" : "bg-primary text-primary-foreground"
                }`}>
                  {t.content}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function CallsTable({ calls }: { calls: Call[] }) {
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState<Call | null>(null);

  const statuses = ["ALL", "COMPLETED", "NO_ANSWER", "FAILED", "IN_PROGRESS", "RINGING"];
  const filtered = filter === "ALL" ? calls : calls.filter((c) => c.status === filter);

  if (calls.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-xl p-16 text-center">
        <Phone size={40} className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-semibold text-lg mb-1">No calls yet</h3>
        <p className="text-muted-foreground text-sm">Start a campaign to begin making AI-powered calls.</p>
      </div>
    );
  }

  return (
    <>
      {selected && <TranscriptModal call={selected} onClose={() => setSelected(null)} />}

      <div className="space-y-4">
        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                filter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-accent border-input"
              }`}
            >
              {s === "ALL" ? `All (${calls.length})` : s.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                {["Contact", "Campaign", "Status", "Duration", "Sentiment", "Outcome", "Date", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    No calls with status &quot;{filter}&quot;
                  </td>
                </tr>
              ) : (
                filtered.map((call) => (
                  <tr key={call.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{call.contact.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{call.contact.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-[120px]">
                      <span className="truncate block">{call.campaign.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${statusColors[call.status] || "bg-muted text-muted-foreground"}`}>
                        {call.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {formatDuration(call.duration)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {call.sentiment ? sentimentEmoji[call.sentiment] : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground capitalize">
                      {call.outcome?.replace(/_/g, " ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(call.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      {call.transcripts.length > 0 || call.summary ? (
                        <button
                          onClick={() => setSelected(call)}
                          className="text-xs text-primary hover:underline font-medium whitespace-nowrap"
                        >
                          View transcript
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
