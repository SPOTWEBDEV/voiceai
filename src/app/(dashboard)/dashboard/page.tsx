import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Megaphone, Phone, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const [contactGroups, campaigns, calls, completedCalls] = await Promise.all([
    prisma.contactGroup.count({ where: { userId } }),
    prisma.campaign.count({ where: { userId } }),
    prisma.call.count({ where: { userId } }),
    prisma.call.count({ where: { userId, status: "COMPLETED" } }),
  ]);

  // Count total contacts across all groups
  const totalContacts = await prisma.contact.count({
    where: { contactGroup: { userId } },
  });

  const stats = [
    { label: "Contact Groups", value: contactGroups, icon: Users, color: "text-blue-500", sub: `${totalContacts} total contacts` },
    { label: "Campaigns", value: campaigns, icon: Megaphone, color: "text-purple-500", sub: "all time" },
    { label: "Calls Made", value: calls, icon: Phone, color: "text-green-500", sub: "all time" },
    {
      label: "Completion Rate",
      value: calls > 0 ? `${Math.round((completedCalls / calls) * 100)}%` : "0%",
      icon: TrendingUp,
      color: "text-orange-500",
      sub: `${completedCalls} completed`,
    },
  ];

  const recentCalls = await prisma.call.findMany({
    where: { userId },
    include: {
      contact: { select: { name: true } },
      campaign: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session?.user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, sub }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={cn("h-5 w-5", color)} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Calls</CardTitle></CardHeader>
        <CardContent>
          {recentCalls.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No calls yet. Start a campaign to begin.</p>
          ) : (
            <div className="divide-y">
              {recentCalls.map((call) => (
                <div key={call.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{call.contact.name}</p>
                    <p className="text-xs text-muted-foreground">{call.campaign.name}</p>
                  </div>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium",
                    call.status === "COMPLETED" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
                    call.status === "FAILED" ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {call.status.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
