import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, MessageSquare, Mail } from "lucide-react";

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  PAUSED: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
};

const channelConfig: Record<string, { icon: any; color: string }> = {
  CALL: { icon: Phone, color: "text-violet-600 bg-violet-100 dark:bg-violet-900/20 dark:text-violet-400" },
  SMS: { icon: MessageSquare, color: "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400" },
  EMAIL: { icon: Mail, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400" },
};

export default async function AdminCampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
      contactGroups: { include: { contactGroup: { select: { name: true, _count: { select: { contacts: true } } } } } },
      _count: { select: { calls: true, messages: true } },
    },
  });

  const byStatus = campaigns.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {} as Record<string, number>);
  const byChannel = campaigns.reduce((acc, c) => { acc[c.channelType] = (acc[c.channelType] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Campaigns</h1>
        <p className="text-muted-foreground">{campaigns.length} campaigns across all users</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-xl bg-card p-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">By Status</p>
          <div className="flex flex-wrap gap-2">
            {["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "FAILED"].map((s) => (
              <div key={s} className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[s]}`}>
                {s} <span className="font-bold">{byStatus[s] || 0}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border rounded-xl bg-card p-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">By Channel</p>
          <div className="flex flex-wrap gap-2">
            {["CALL", "SMS", "EMAIL"].map((ch) => {
              const conf = channelConfig[ch];
              const Icon = conf.icon;
              return (
                <div key={ch} className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${conf.color}`}>
                  <Icon size={12} />{ch} <span className="font-bold">{byChannel[ch] || 0}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Campaign List</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                {["Campaign", "Channel", "Owner", "Contact Groups", "Status", "Activity", "Created"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">No campaigns yet</td></tr>
              ) : campaigns.map((c, i) => {
                const ch = channelConfig[c.channelType] || channelConfig.CALL;
                const ChIcon = ch.icon;
                const activity = c.channelType === "CALL" ? `${c._count.calls} calls` : `${c._count.messages} msgs`;
                return (
                  <tr key={c.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">{c.objective || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${ch.color}`}>
                        <ChIcon size={11} />{c.channelType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <p>{c.user.name || "—"}</p>
                      <p className="truncate max-w-[120px]">{c.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {c.contactGroups.length > 0
                        ? c.contactGroups.map((cg) => `${cg.contactGroup.name} (${cg.contactGroup._count.contacts})`).join(", ")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[c.status]}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{activity}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
