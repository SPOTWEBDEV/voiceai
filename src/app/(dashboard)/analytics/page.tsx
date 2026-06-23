import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AnalyticsPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const [totalCalls, completedCalls, interestedContacts, callbackContacts, avgDurationResult] = await Promise.all([
    prisma.call.count({ where: { userId } }),
    prisma.call.count({ where: { userId, status: "COMPLETED" } }),
    prisma.contact.count({ where: { userId, status: "INTERESTED" } }),
    prisma.contact.count({ where: { userId, status: "CALLBACK" } }),
    prisma.call.aggregate({ where: { userId, status: "COMPLETED", duration: { not: null } }, _avg: { duration: true } }),
  ]);

  const avgDuration = avgDurationResult._avg.duration ? Math.round(avgDurationResult._avg.duration) : 0;
  const answerRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;

  const outcomes = await prisma.call.groupBy({
    by: ["outcome"],
    where: { userId, outcome: { not: null } },
    _count: true,
  });

  const recentCalls = await prisma.call.findMany({
    where: { userId, status: "COMPLETED" },
    select: { sentiment: true, outcome: true, summary: true, createdAt: true, contact: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = [
    { label: "Total Calls", value: totalCalls, sub: "all time" },
    { label: "Completed", value: completedCalls, sub: `${answerRate}% answer rate` },
    { label: "Interested Leads", value: interestedContacts, sub: "ready to convert" },
    { label: "Callback Requests", value: callbackContacts, sub: "need follow-up" },
    { label: "Avg Duration", value: `${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s`, sub: "completed calls" },
  ];

  const sentimentIcons: Record<string, string> = { positive: "😊", neutral: "😐", negative: "😟" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Campaign performance and call insights</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(({ label, value, sub }) => (
          <Card key={label}>
            <CardHeader className="pb-1"><CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Call Outcomes</CardTitle></CardHeader>
          <CardContent>
            {outcomes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-3">
                {outcomes.map((o) => (
                  <div key={o.outcome} className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">{o.outcome?.replace(/_/g, " ")}</Badge>
                    <span className="text-sm font-medium">{o._count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent Call Summaries</CardTitle></CardHeader>
          <CardContent>
            {recentCalls.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No completed calls yet</p>
            ) : (
              <div className="space-y-4">
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
      </div>
    </div>
  );
}
