import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Megaphone, Phone, TrendingUp, MessageSquare, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const [contactGroups, campaigns, calls, completedCalls, totalSMS, sentSMS, totalEmails, sentEmails] = await Promise.all([
    prisma.contactGroup.count({ where: { userId } }),
    prisma.campaign.count({ where: { userId } }),
    prisma.call.count({ where: { userId } }),
    prisma.call.count({ where: { userId, status: "COMPLETED" } }),
    prisma.message.count({ where: { userId, type: "SMS" } }),
    prisma.message.count({ where: { userId, type: "SMS", status: { in: ["SENT", "DELIVERED"] } } }),
    prisma.message.count({ where: { userId, type: "EMAIL" } }),
    prisma.message.count({ where: { userId, type: "EMAIL", status: { in: ["SENT", "DELIVERED"] } } }),
  ]);

  const totalContacts = await prisma.contact.count({ where: { contactGroup: { userId } } });

  const stats = [
    { label: "Contact Groups", value: contactGroups, icon: Users, color: "text-blue-500", sub: `${totalContacts} total contacts`, href: "/contacts" },
    { label: "Campaigns", value: campaigns, icon: Megaphone, color: "text-purple-500", sub: "all time", href: "/campaigns" },
    { label: "Voice Calls", value: calls, icon: Phone, color: "text-violet-500", sub: `${completedCalls} completed`, href: "/calls" },
    { label: "SMS Sent", value: totalSMS, icon: MessageSquare, color: "text-green-500", sub: `${sentSMS} delivered`, href: "/messages" },
    { label: "Emails Sent", value: totalEmails, icon: Mail, color: "text-blue-400", sub: `${sentEmails} delivered`, href: "/messages" },
    { label: "Success Rate", value: calls > 0 ? `${Math.round((completedCalls / calls) * 100)}%` : "—", icon: TrendingUp, color: "text-orange-500", sub: "call completion", href: "/analytics" },
  ];

  const recentCalls = await prisma.call.findMany({
    where: { userId },
    include: { contact: { select: { name: true } }, campaign: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const recentMessages = await prisma.message.findMany({
    where: { userId },
    include: { contact: { select: { name: true } }, campaign: { select: { name: true, channelType: true } } },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const typeColors: Record<string, string> = {
    SMS: "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400",
    EMAIL: "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session?.user?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, sub, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className={cn("h-5 w-5", color)} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Calls */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Calls</CardTitle>
            <Link href="/calls" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            {recentCalls.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <Phone size={28} className="mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No calls yet.</p>
                <Link href="/campaigns/new" className="text-xs text-primary hover:underline">Create a voice campaign →</Link>
              </div>
            ) : (
              <div className="divide-y">
                {recentCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium">{call.contact.name}</p>
                      <p className="text-xs text-muted-foreground">{call.campaign.name}</p>
                    </div>
                    <span className={cn("text-xs px-2 py-1 rounded-full font-medium",
                      call.status === "COMPLETED" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
                      call.status === "FAILED" ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" :
                      "bg-muted text-muted-foreground"
                    )}>{call.status.replace(/_/g, " ")}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Messages</CardTitle>
            <Link href="/messages" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            {recentMessages.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <MessageSquare size={28} className="mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No messages yet.</p>
                <Link href="/campaigns/new" className="text-xs text-primary hover:underline">Create an SMS or Email campaign →</Link>
              </div>
            ) : (
              <div className="divide-y">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium">{msg.contact.name}</p>
                      <p className="text-xs text-muted-foreground">{msg.campaign.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[msg.type] || "bg-muted text-muted-foreground"}`}>{msg.type}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                        msg.status === "SENT" || msg.status === "DELIVERED" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
                        msg.status === "FAILED" ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" :
                        "bg-muted text-muted-foreground"
                      )}>{msg.status}</span>
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
