"use client";
import { useState } from "react";
import { MessageSquare, Mail, Phone } from "lucide-react";

const statusColors: Record<string, string> = {
  SENT: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  DELIVERED: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  PENDING: "bg-muted text-muted-foreground",
};

const typeIcons: Record<string, any> = {
  SMS: MessageSquare,
  EMAIL: Mail,
  CALL: Phone,
};

const typeColors: Record<string, string> = {
  SMS: "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400",
  EMAIL: "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400",
  CALL: "text-violet-600 bg-violet-100 dark:bg-violet-900/20 dark:text-violet-400",
};

interface Message {
  id: string;
  type: string;
  status: string;
  to: string;
  errorMessage?: string | null;
  sentAt?: string | Date | null;
  createdAt: string | Date;
  contact: { name: string; phone: string; email?: string | null };
  campaign: { name: string; channelType: string };
}

export default function MessagesTable({ messages }: { messages: Message[] }) {
  const [filter, setFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const filtered = messages.filter((m) => {
    const statusMatch = filter === "ALL" || m.status === filter;
    const typeMatch = typeFilter === "ALL" || m.type === typeFilter;
    return statusMatch && typeMatch;
  });

  const counts = { SMS: messages.filter((m) => m.type === "SMS").length, EMAIL: messages.filter((m) => m.type === "EMAIL").length };

  if (messages.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-xl p-16 text-center">
        <MessageSquare size={40} className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-semibold text-lg mb-1">No messages yet</h3>
        <p className="text-muted-foreground text-sm">Create an SMS or Email campaign and start sending to see messages here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: messages.length, color: "text-foreground" },
          { label: "SMS Sent", value: counts.SMS, color: "text-green-600" },
          { label: "Emails Sent", value: counts.EMAIL, color: "text-blue-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="border rounded-xl p-4 bg-card">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "SMS", "EMAIL"].map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${typeFilter === t ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent border-input"}`}>
            {t === "ALL" ? "All Types" : t}
          </button>
        ))}
        <div className="w-px bg-border mx-1" />
        {["ALL", "SENT", "DELIVERED", "FAILED", "PENDING"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent border-input"}`}>
            {s === "ALL" ? "All Status" : s}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">Showing {filtered.length} of {messages.length} messages</p>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              {["Type", "Contact", "Campaign", "Sent To", "Status", "Error", "Date"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">No messages match your filters.</td></tr>
            ) : filtered.map((msg) => {
              const Icon = typeIcons[msg.type] || MessageSquare;
              return (
                <tr key={msg.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium ${typeColors[msg.type] || "bg-muted text-muted-foreground"}`}>
                      <Icon size={11} />{msg.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{msg.contact.name}</p>
                    <p className="text-xs text-muted-foreground">{msg.contact.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs max-w-[120px] truncate">{msg.campaign.name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate" title={msg.to}>{msg.to}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[msg.status] || "bg-muted text-muted-foreground"}`}>{msg.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-red-500 max-w-[150px] truncate" title={msg.errorMessage || ""}>{msg.errorMessage || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
