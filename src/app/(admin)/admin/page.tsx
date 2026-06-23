import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Megaphone, Phone, TrendingUp, Activity, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function AdminPage() {
  const [
    totalUsers, totalContacts, totalCampaigns,
    totalCalls, completedCalls, activeUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.contact.count(),
    prisma.campaign.count(),
    prisma.call.count(),
    prisma.call.count({ where: { status: "COMPLETED" } }),
    prisma.user.count({ where: { campaigns: { some: {} } } }),
  ]);

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { campaigns: true, calls: true } } },
  });

  const recentCalls = await prisma.call.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      contact: { select: { name: true } },
      campaign: { select: { name: true } },
      user: { select: { email: true } },
    },
  });

  const answerRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-blue-500", sub: `${activeUsers} with campaigns` },
    { label: "Total Contacts", value: totalContacts, icon: Activity, color: "text-green-500", sub: "across all users" },
    { label: "Campaigns", value: totalCampaigns, icon: Megaphone, color: "text-purple-500", sub: "all time" },
    { label: "Total Calls", value: totalCalls, icon: Phone, color: "text-orange-500", sub: `${answerRate}% completion` },
    { label: "Completed Calls", value: completedCalls, icon: TrendingUp, color: "text-emerald-500", sub: "successfully finished" },
    { label: "Revenue", value: "$0", icon: DollarSign, color: "text-yellow-500", sub: "Billing not yet active" },
  ];

  const statusColor: Record<string, string> = {
    COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    FAILED: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    NO_ANSWER: "bg-muted text-muted-foreground",
    IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    QUEUED: "bg-muted text-muted-foreground",
    RINGING: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-muted-foreground">Real-time stats across all users and campaigns</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, sub }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</CardTitle>
              <Icon className={cn("h-5 w-5", color)} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Signups</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Campaigns</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Calls</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Role</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u, i) => (
                  <tr key={u.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-xs">{u.name || "—"}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[140px]">{u.email}</p>
                    </td>
                    <td className="px-4 py-2.5 text-xs">{u._count.campaigns}</td>
                    <td className="px-4 py-2.5 text-xs">{u._count.calls}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "ADMIN" ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" : "bg-muted text-muted-foreground"}`}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Recent Calls */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Calls (All Users)</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Contact</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentCalls.map((call, i) => (
                  <tr key={call.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-xs">{call.contact.name}</p>
                      <p className="text-xs text-muted-foreground">{call.campaign.name}</p>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground truncate max-w-[120px]">{call.user.email}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[call.status] || "bg-muted text-muted-foreground"}`}>
                        {call.status.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
