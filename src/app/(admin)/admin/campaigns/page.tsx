import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  PAUSED: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
};

export default async function AdminCampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
      _count: { select: { calls: true } },
    },
  });

  const byStatus = campaigns.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Campaigns</h1>
        <p className="text-muted-foreground">{campaigns.length} campaigns across all users</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "FAILED"].map((s) => (
          <div key={s} className="border rounded-xl p-3 bg-card">
            <div className="text-xl font-bold">{byStatus[s] || 0}</div>
            <div className={`text-xs mt-1 px-1.5 py-0.5 rounded-full inline-block font-medium ${statusColors[s]}`}>{s}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Campaign List</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                {["Campaign", "Owner", "Voice", "Status", "Calls", "Created"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, i) => (
                <tr key={c.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">{c.objective || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <p>{c.user.name || "—"}</p>
                    <p className="truncate max-w-[140px]">{c.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{c.voice}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c._count.calls}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
