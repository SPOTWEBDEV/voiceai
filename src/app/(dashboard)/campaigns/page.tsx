import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Phone, Users, Pencil, MessageSquare, Mail } from "lucide-react";
import StartCampaignButton from "@/components/campaigns/StartCampaignButton";
import DeleteCampaignButton from "@/components/campaigns/DeleteCampaignButton";

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  DRAFT: "secondary", ACTIVE: "default", PAUSED: "outline", COMPLETED: "outline", FAILED: "destructive",
};

const channelConfig: Record<string, { icon: any; label: string; color: string }> = {
  CALL: { icon: Phone, label: "Voice Call", color: "text-violet-600 bg-violet-100 dark:bg-violet-900/20 dark:text-violet-400" },
  SMS: { icon: MessageSquare, label: "SMS", color: "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400" },
  EMAIL: { icon: Mail, label: "Email", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400" },
};

export default async function CampaignsPage() {
  const session = await auth();
  const campaigns = await prisma.campaign.findMany({
    where: { userId: session!.user!.id },
    include: {
      _count: { select: { calls: true, messages: true } },
      contactGroups: {
        include: { contactGroup: { select: { id: true, name: true, _count: { select: { contacts: true } } } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Create and manage your outreach campaigns</p>
        </div>
        <Link href="/campaigns/new"><Button><Plus size={16} className="mr-2" />New Campaign</Button></Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="border-2 border-dashed rounded-xl p-16 text-center">
          <div className="flex justify-center gap-3 mb-4">
            <Phone size={32} className="text-violet-400" />
            <MessageSquare size={32} className="text-green-400" />
            <Mail size={32} className="text-blue-400" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No campaigns yet</h3>
          <p className="text-muted-foreground mb-4 text-sm">Create a voice call, SMS, or email campaign to start reaching your contacts.</p>
          <Link href="/campaigns/new"><Button>Create Campaign</Button></Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => {
            const channel = channelConfig[campaign.channelType] || channelConfig.CALL;
            const ChannelIcon = channel.icon;
            const totalContacts = campaign.contactGroups.reduce((s, cg) => s + cg.contactGroup._count.contacts, 0);
            const canStart = campaign.status === "DRAFT" || campaign.status === "PAUSED";
            const activityCount = campaign.channelType === "CALL" ? campaign._count.calls : campaign._count.messages;

            return (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${channel.color.split(" ").slice(1).join(" ")}`}>
                        <ChannelIcon size={18} className={channel.color.split(" ")[0]} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-base">{campaign.name}</CardTitle>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${channel.color}`}>{channel.label}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{campaign.objective || "No objective set"}</p>
                      </div>
                    </div>
                    <Badge variant={statusColors[campaign.status]}>{campaign.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Contact groups */}
                  {campaign.contactGroups.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {campaign.contactGroups.map((cg) => (
                        <span key={cg.contactGroup.id} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                          <Users size={11} />{cg.contactGroup.name} <span className="text-primary/70">({cg.contactGroup._count.contacts})</span>
                        </span>
                      ))}
                      <span className="text-xs text-muted-foreground">→ {totalContacts} total</span>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-500 flex items-center gap-1"><Users size={12} />No contact groups</span>
                  )}

                  {/* Stats + actions */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ChannelIcon size={13} />
                        {activityCount} {campaign.channelType === "CALL" ? "calls" : campaign.channelType === "SMS" ? "SMS" : "emails"}
                      </span>
                      <span className="text-xs">{new Date(campaign.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/campaigns/edit/${campaign.id}`}>
                        <Button variant="outline" size="sm"><Pencil size={13} className="mr-1" />Edit</Button>
                      </Link>
                      <DeleteCampaignButton campaignId={campaign.id} campaignName={campaign.name} />
                      {campaign.contactGroups.length > 0
                        ? <StartCampaignButton campaignId={campaign.id} status={campaign.status} />
                        : canStart && <span className="text-xs text-amber-500 border border-amber-300 px-2.5 py-1.5 rounded-lg">Assign contacts first</span>
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
