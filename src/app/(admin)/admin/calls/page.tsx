import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statusColors: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  NO_ANSWER: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  QUEUED: "bg-muted text-muted-foreground",
  RINGING: "bg-yellow-100 text-yellow-700",
  BUSY: "bg-muted text-muted-foreground",
  CANCELED: "bg-muted text-muted-foreground",
};

const sentimentIcons: Record<string, string> = { positive: "😊", neutral: "😐", negative: "😟" };

function formatDuration(s: number | null) {
  if (!s) return "—";
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

export default async function AdminCallsPage() {
  const calls = await prisma.call.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      contact: { select: { name: true, phone: true } },
      campaign: { select: { name: true } },
      user: { select: { email: true } },
    },
  });

  const total = calls.length;
  const completed = calls.filter((c) => c.status === "COMPLETED").length;
  const failed = calls.filter((c) => c.status === "FAILED").length;
  const noAnswer = calls.filter((c) => c.status === "NO_ANSWER").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Calls</h1>
        <p className="text-muted-foreground">Last 200 calls across all users</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: total, color: "text-foreground" },
          { label: "Completed", value: completed, color: "text-green-600" },
          { label: "Failed", value: failed, color: "text-red-600" },
          { label: "No Answer", value: noAnswer, color: "text-muted-foreground" },
        ].map(({ label, value, color }) => (
          <div key={label} className="border rounded-xl p-4 bg-card">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Call Log</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  {["Contact", "Campaign", "Owner", "Status", "Duration", "Sentiment", "Outcome", "Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calls.map((call, i) => (
                  <tr key={call.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-xs">{call.contact.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{call.contact.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[120px] truncate">{call.campaign.name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[120px] truncate">{call.user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${statusColors[call.status] || "bg-muted text-muted-foreground"}`}>
                        {call.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDuration(call.duration)}</td>
                    <td className="px-4 py-3 text-xs">{call.sentiment ? sentimentIcons[call.sentiment] : "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{call.outcome?.replace(/_/g, " ") || "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(call.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
