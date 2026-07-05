import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StartCampaignButton from "@/components/campaigns/StartCampaignButton";
import DeleteCampaignButton from "@/components/campaigns/DeleteCampaignButton";
import Link from "next/link";
import { ArrowLeft, Phone, Clock, TrendingUp, Pencil, Users, MessageSquare, Mail, CheckCircle, XCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  PAUSED: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
};

const channelConfig: Record<string, { icon: any; label: string; color: string }> = {
  CALL: { icon: Phone, label: "Voice Call", color: "text-violet-600" },
  SMS: { icon: MessageSquare, label: "SMS", color: "text-green-600" },
  EMAIL: { icon: Mail, label: "Email", color: "text-blue-600" },
};

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const campaign = await prisma.campaign.findFirst({
    where: { id, userId: session.user!.id },
    include: {
      contactGroups: { include: { contactGroup: { select: { id: true, name: true, _count: { select: { contacts: true } } } } } },
      calls: { include: { contact: { select: { name: true, phone: true } } }, orderBy: { createdAt: "desc" }, take: 50 },
      messages: { include: { contact: { select: { name: true, phone: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 50 },
      _count: { select: { calls: true, messages: true } },
    },
  });

  if (!campaign) redirect("/campaigns");

  const channel = channelConfig[campaign.channelType] || channelConfig.CALL;
  const ChannelIcon = channel.icon;
  const totalContacts = campaign.contactGroups.reduce((s, cg) => s + cg.contactGroup._count.contacts, 0);

  // Stats per channel
  const isCall = campaign.channelType === "CALL";
  const isSms = campaign.channelType === "SMS";
  const isEmail = campaign.channelType === "EMAIL";

  const completedCalls = campaign.calls.filter((c) => c.status === "COMPLETED").length;
  const failedCalls = campaign.calls.filter((c) => c.status === "FAILED").length;
  const sentMessages = campaign.messages.filter((m) => m.status === "SENT" || m.status === "DELIVERED").length;
  const failedMessages = campaign.messages.filter((m) => m.status === "FAILED").length;
  const interested = campaign.calls.filter((c) => c.outcome === "interested").length;

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/campaigns" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={15} /> Back to campaigns
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isCall ? "bg-violet-100 dark:bg-violet-900/20" : isSms ? "bg-green-100 dark:bg-green-900/20" : "bg-blue-100 dark:bg-blue-900/20"}`}>
            <ChannelIcon size={22} className={channel.color} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{campaign.name}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isCall ? "text-violet-600 bg-violet-100 dark:bg-violet-900/20 dark:text-violet-400" : isSms ? "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400" : "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"}`}>
                {channel.label}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">{campaign.objective || "No objective set"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${statusColors[campaign.status]}`}>{campaign.status}</span>
          <Link href={`/campaigns/edit/${campaign.id}`}>
            <button className="inline-flex items-center gap-1.5 text-sm border border-input hover:bg-accent px-3 py-1.5 rounded-lg font-medium transition-colors"><Pencil size={13} />Edit</button>
          </Link>
          <DeleteCampaignButton campaignId={campaign.id} campaignName={campaign.name} />
          {campaign.contactGroups.length > 0 && <StartCampaignButton campaignId={campaign.id} status={campaign.status} />}
        </div>
      </div>

      {/* Contact groups */}
      {campaign.contactGroups.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground flex items-center gap-1"><Users size={14} />Contact groups:</span>
          {campaign.contactGroups.map((cg) => (
            <span key={cg.contactGroup.id} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
              {cg.contactGroup.name} ({cg.contactGroup._count.contacts})
            </span>
          ))}
          <span className="text-xs text-muted-foreground">→ {totalContacts} total</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isCall ? [
          { label: "Total Calls", value: campaign._count.calls, icon: Phone },
          { label: "Completed", value: completedCalls, icon: Clock },
          { label: "Failed", value: failedCalls, icon: XCircle },
          { label: "Interested", value: interested, icon: TrendingUp },
        ] : [
          { label: `Total ${isSms ? "SMS" : "Emails"}`, value: campaign._count.messages, icon: ChannelIcon },
          { label: "Sent", value: sentMessages, icon: CheckCircle },
          { label: "Failed", value: failedMessages, icon: XCircle },
          { label: "Success Rate", value: campaign._count.messages > 0 ? `${Math.round((sentMessages / campaign._count.messages) * 100)}%` : "0%", icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-xs text-muted-foreground font-medium">{label}</CardTitle>
              <Icon size={14} className="text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
          </Card>
        ))}
      </div>

      {/* Config */}
      <Card>
        <CardHeader><CardTitle className="text-base">Campaign Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {isCall && campaign.script && (
            <div><p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Opening Script</p>
              <div className="bg-muted rounded-xl p-4 text-sm leading-relaxed">{campaign.script}</div></div>
          )}
          {isCall && campaign.systemPrompt && (
            <div><p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">AI Instructions</p>
              <div className="bg-muted rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap">{campaign.systemPrompt}</div></div>
          )}
          {isSms && campaign.smsBody && (
            <div><p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">SMS Message</p>
              <div className="bg-muted rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap">{campaign.smsBody}</div></div>
          )}
          {isEmail && (
            <>
              {campaign.emailSubject && (
                <div><p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Subject</p>
                  <div className="bg-muted rounded-xl p-4 text-sm">{campaign.emailSubject}</div></div>
              )}
              {campaign.emailBodyHtml && (
                <div><p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Email Body Preview</p>
                  <div className="bg-muted rounded-xl p-4 text-sm leading-relaxed border" dangerouslySetInnerHTML={{ __html: campaign.emailBodyHtml }} /></div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Activity table */}
      <Card>
        <CardHeader><CardTitle className="text-base">{isCall ? `Calls (${campaign._count.calls})` : `Messages (${campaign._count.messages})`}</CardTitle></CardHeader>
        <CardContent className="p-0">
          {isCall ? (
            campaign.calls.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10 px-6">No calls yet. Start the campaign to begin calling.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>{["Contact", "Phone", "Status", "Outcome", "Error", "Date"].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {campaign.calls.map((call) => (
                    <tr key={call.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{call.contact.name}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{call.contact.phone}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${call.status === "COMPLETED" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : call.status === "FAILED" ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" : "bg-muted text-muted-foreground"}`}>{call.status.replace(/_/g, " ")}</span></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{call.outcome?.replace(/_/g, " ") || "—"}</td>
                      <td className="px-4 py-3 text-xs text-red-500 max-w-[180px] truncate" title={(call as any).errorMessage || ""}>{(call as any).errorMessage || "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(call.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            campaign.messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10 px-6">No messages sent yet. Start the campaign to begin sending.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>{["Contact", "Sent To", "Status", "Error", "Date"].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {campaign.messages.map((msg) => (
                    <tr key={msg.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{msg.contact.name}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate" title={msg.to}>{msg.to}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${msg.status === "SENT" || msg.status === "DELIVERED" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : msg.status === "FAILED" ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" : "bg-muted text-muted-foreground"}`}>{msg.status}</span></td>
                      <td className="px-4 py-3 text-xs text-red-500 max-w-[180px] truncate">{(msg as any).errorMessage || "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
