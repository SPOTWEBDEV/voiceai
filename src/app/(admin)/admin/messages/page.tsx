import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Mail } from "lucide-react";

const statusColors: Record<string, string> = {
  SENT: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  DELIVERED: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  PENDING: "bg-muted text-muted-foreground",
};

const typeConfig: Record<string, { icon: any; color: string }> = {
  SMS: { icon: MessageSquare, color: "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400" },
  EMAIL: { icon: Mail, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400" },
};

export default async function AdminMessagesPage() {
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    include: {
      contact: { select: { name: true, phone: true, email: true } },
      campaign: { select: { name: true, channelType: true } },
      user: { select: { email: true, name: true } },
    },
  });

  const totalSMS = messages.filter((m) => m.type === "SMS").length;
  const totalEmail = messages.filter((m) => m.type === "EMAIL").length;
  const totalSent = messages.filter((m) => m.status === "SENT" || m.status === "DELIVERED").length;
  const totalFailed = messages.filter((m) => m.status === "FAILED").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Messages</h1>
        <p className="text-muted-foreground">SMS and Email messages across all users (last 300)</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Messages", value: messages.length, color: "text-foreground" },
          { label: "SMS", value: totalSMS, color: "text-green-600" },
          { label: "Email", value: totalEmail, color: "text-blue-600" },
          { label: "Failed", value: totalFailed, color: "text-red-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="border rounded-xl p-4 bg-card">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Message Log</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  {["Type", "Contact", "Campaign", "Owner", "Sent To", "Status", "Error", "Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {messages.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground text-sm">No messages yet</td></tr>
                ) : messages.map((msg, i) => {
                  const conf = typeConfig[msg.type] || typeConfig.SMS;
                  const Icon = conf.icon;
                  return (
                    <tr key={msg.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${conf.color}`}>
                          <Icon size={11} />{msg.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-xs">{msg.contact.name}</p>
                        <p className="text-xs text-muted-foreground">{msg.contact.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[120px] truncate">{msg.campaign.name}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[120px] truncate">{msg.user.email}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[150px] truncate" title={msg.to}>{msg.to}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${statusColors[msg.status] || "bg-muted text-muted-foreground"}`}>
                          {msg.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-red-500 max-w-[150px] truncate" title={msg.errorMessage || ""}>
                        {msg.errorMessage || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
