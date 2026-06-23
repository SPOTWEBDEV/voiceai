import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BarChart2, Phone } from "lucide-react";
import StartCampaignButton from "@/components/campaigns/StartCampaignButton";

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  DRAFT: "secondary", ACTIVE: "default", PAUSED: "outline", COMPLETED: "outline", FAILED: "destructive",
};

export default async function CampaignsPage() {
  const session = await auth();
  const campaigns = await prisma.campaign.findMany({
    where: { userId: session!.user!.id },
    include: { _count: { select: { calls: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Create and manage your AI voice campaigns</p>
        </div>
        <Link href="/campaigns/new"><Button><Plus size={16} className="mr-2" />New Campaign</Button></Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="border-2 border-dashed rounded-xl p-16 text-center">
          <Phone size={40} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold text-lg mb-1">No campaigns yet</h3>
          <p className="text-muted-foreground mb-4">Create your first AI voice campaign to start calling contacts.</p>
          <Link href="/campaigns/new"><Button>Create Campaign</Button></Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{campaign.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{campaign.objective || "No objective set"}</p>
                  </div>
                  <Badge variant={statusColors[campaign.status]}>{campaign.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Phone size={14} />{campaign._count.calls} calls</span>
                    <span>Voice: {campaign.voice}</span>
                    <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/campaigns/${campaign.id}`}><Button variant="outline" size="sm"><BarChart2 size={14} className="mr-1" />Details</Button></Link>
                    {(campaign.status === "DRAFT" || campaign.status === "PAUSED") && <StartCampaignButton campaignId={campaign.id} />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
