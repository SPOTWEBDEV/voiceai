import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, MessageSquare, Mail, TrendingUp } from "lucide-react";

export default async function AnalyticsPage() {
  const session = await auth();
  const userId = session!.user!.id;
  

  const [
    totalCalls, completedCalls, totalSMS, sentSMS, totalEmails, sentEmails,
    interestedContacts, callbackContacts, avgDurationResult,
  ] = await Promise.all([
    prisma.call.count({ where: { userId } }),
    prisma.call.count({ where: { userId, status: "COMPLETED" } }),
    prisma.message.count({ where: { userId, type: "SMS" } }),
    prisma.message.count({ where: { userId, type: "SMS", status: { in: ["SENT", "DELIVERED"] } } }),
    prisma.message.count({ where: { userId, type: "EMAIL" } }),
    prisma.message.count({ where: { userId, type: "EMAIL", status: { in: ["SENT", "DELIVERED"] } } }),
    prisma.contact.count({ where: { contactGroup: { userId }, status: "INTERESTED" } }),
    prisma.contact.count({ where: { contactGroup: { userId }, status: "CALLBACK" } }),
    prisma.call.aggregate({ where: { userId, status: "COMPLETED", duration: { not: null } }, _avg: { duration: true } }),
  ]);

  const avgDuration = avgDurationResult._avg.duration ? Math.round(avgDurationResult._avg.duration) : 0;
  const callAnswerRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;
  const smsDeliveryRate = totalSMS > 0 ? Math.round((sentSMS / totalSMS) * 100) : 0;
  const emailDeliveryRate = totalEmails > 0 ? Math.round((sentEmails / totalEmails) * 100) : 0;

  const callOutcomes = await prisma.call.groupBy({
    by: ["outcome"], where: { userId, outcome: { not: null } }, _count: true,
  });

  const msgStatusByType = await prisma.message.groupBy({
    by: ["type", "status"], where: { userId }, _count: true,
  });

  const recentCalls = await prisma.call.findMany({
    where: { userId, status: "COMPLETED" },
    select: { sentiment: true, outcome: true, summary: true, createdAt: true, contact: { select: { name: true } } },
    orderBy: { createdAt: "desc" }, take: 5,
  });

  const recentMessages = await prisma.message.findMany({
    where: { userId },
    include: { contact: { select: { name: true } }, campaign: { select: { name: true, channelType: true } } },
    orderBy: { createdAt: "desc" }, take: 5,
  });

  const sentimentIcons: Record<string, string> = { positive: "😊", neutral: "😐", negative: "😟" };
  const typeColors: Record<string, string> = {
    SMS: "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400",
    EMAIL: "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Performance across all campaign types</p>
      </div>

      {/* Channel summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Calls */}
        <div className="border rounded-xl bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center">
              <Phone size={18} className="text-violet-600 dark:text-violet-400" />
            </div>
            <span className="font-semibold">Voice Calls</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Total", value: totalCalls },
              { label: "Completed", value: completedCalls },
              { label: "Answer Rate", value: `${callAnswerRate}%` },
              { label: "Interested", value: interestedContacts },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/50 rounded-lg p-2.5">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Avg duration: {Math.floor(avgDuration / 60)}m {avgDuration % 60}s</p>
        </div>

        {/* SMS */}
        <div className="border rounded-xl bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <MessageSquare size={18} className="text-green-600 dark:text-green-400" />
            </div>
            <span className="font-semibold">SMS Messages</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Total Sent", value: totalSMS },
              { label: "Delivered", value: sentSMS },
              { label: "Failed", value: totalSMS - sentSMS },
              { label: "Delivery Rate", value: `${smsDeliveryRate}%` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/50 rounded-lg p-2.5">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold">{value}</p>
              </div>
            ))}
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${smsDeliveryRate}%` }} />
          </div>
        </div>

        {/* Email */}
        <div className="border rounded-xl bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Mail size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-semibold">Emails</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Total Sent", value: totalEmails },
              { label: "Delivered", value: sentEmails },
              { label: "Failed", value: totalEmails - sentEmails },
              { label: "Delivery Rate", value: `${emailDeliveryRate}%` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/50 rounded-lg p-2.5">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold">{value}</p>
              </div>
            ))}
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${emailDeliveryRate}%` }} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Call outcomes */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Phone size={16} />Call Outcomes</CardTitle></CardHeader>
          <CardContent>
            {callOutcomes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No call data yet</p>
            ) : (
              <div className="space-y-2">
                {callOutcomes.map((o) => (
                  <div key={o.outcome} className="flex items-center justify-between">
                    <span className="text-sm capitalize border rounded-full px-2.5 py-0.5">{o.outcome?.replace(/_/g, " ")}</span>
                    <span className="text-sm font-medium">{o._count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message status breakdown */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp size={16} />Message Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            {msgStatusByType.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No message data yet</p>
            ) : (
              <div className="space-y-2">
                {msgStatusByType.map((m) => (
                  <div key={`${m.type}-${m.status}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[m.type] || "bg-muted text-muted-foreground"}`}>{m.type}</span>
                      <span className="text-sm text-muted-foreground capitalize">{m.status.toLowerCase()}</span>
                    </div>
                    <span className="text-sm font-medium">{m._count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent call summaries */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Phone size={16} />Recent Call Summaries</CardTitle></CardHeader>
          <CardContent>
            {recentCalls.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No completed calls yet</p>
            ) : (
              <div className="space-y-3">
                {recentCalls.map((call, i) => (
                  <div key={i} className="space-y-1 border-b last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{call.contact.name}</span>
                      <span className="text-xs">{call.sentiment ? sentimentIcons[call.sentiment] : "—"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{call.summary || "No summary available"}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent messages */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageSquare size={16} />Recent Messages</CardTitle></CardHeader>
          <CardContent>
            {recentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No messages sent yet</p>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{msg.contact.name}</p>
                      <p className="text-xs text-muted-foreground">{msg.campaign.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[msg.type] || "bg-muted text-muted-foreground"}`}>{msg.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${msg.status === "SENT" || msg.status === "DELIVERED" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>{msg.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
