import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Phone, Users, Pencil } from "lucide-react";
import StartCampaignButton from "@/components/campaigns/StartCampaignButton";
import DeleteCampaignButton from "@/components/campaigns/DeleteCampaignButton";

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  DRAFT: "secondary",
  ACTIVE: "default",
  PAUSED: "outline",
  COMPLETED: "outline",
  FAILED: "destructive",
};

export default async function CampaignsPage() {
  const session = await auth();
  const campaigns = await prisma.campaign.findMany({
    where: { userId: session!.user!.id },
    include: {
      _count: { select: { calls: true } },
      contactGroups: {
        include: {
          contactGroup: { select: { id: true, name: true, _count: { select: { contacts: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Create and manage your AI voice campaigns</p>
        </div>
        <Link href="/campaigns/new">
          <Button><Plus size={16} className="mr-2" />New Campaign</Button>
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="border-2 border-dashed rounded-xl p-16 text-center">
          <Phone size={40} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold text-lg mb-1">No campaigns yet</h3>
          <p className="text-muted-foreground mb-4 text-sm">Create your first AI voice campaign to start calling contacts.</p>
          <Link href="/campaigns/new"><Button>Create Campaign</Button></Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => {
            const totalContacts = campaign.contactGroups.reduce(
              (sum, cg) => sum + cg.contactGroup._count.contacts, 0
            );
            const canStart = campaign.status === "DRAFT" || campaign.status === "PAUSED";

            return (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base">{campaign.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{campaign.objective || "No objective set"}</p>
                    </div>
                    <Badge variant={statusColors[campaign.status]}>{campaign.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Contact groups */}
                  {campaign.contactGroups.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {campaign.contactGroups.map((cg) => (
                        <span key={cg.contactGroup.id}
                          className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                          <Users size={11} />
                          {cg.contactGroup.name}
                          <span className="text-primary/70">({cg.contactGroup._count.contacts})</span>
                        </span>
                      ))}
                      <span className="text-xs text-muted-foreground flex items-center">
                        → {totalContacts} total contacts
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-500 flex items-center gap-1">
                      <Users size={12} /> No contact groups assigned
                    </span>
                  )}

                  {/* Stats + actions */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Phone size={13} />{campaign._count.calls} calls</span>
                      <span className="text-xs capitalize">Voice: {campaign.voice}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Edit */}
                      <Link href={`/campaigns/edit/${campaign.id}`}>
                        <Button variant="outline" size="sm">
                          <Pencil size={13} className="mr-1" />Edit
                        </Button>
                      </Link>

                      {/* Delete */}
                      <DeleteCampaignButton campaignId={campaign.id} campaignName={campaign.name} />

                      {/* Start / Pause */}
                      {campaign.contactGroups.length > 0 ? (
                        <StartCampaignButton campaignId={campaign.id} status={campaign.status} />
                      ) : (
                        canStart && (
                          <span className="text-xs text-amber-500 border border-amber-300 px-2.5 py-1.5 rounded-lg">
                            Assign contacts first
                          </span>
                        )
                      )}
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
