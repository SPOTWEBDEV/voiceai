import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StartCampaignButton from "@/components/campaigns/StartCampaignButton";
import Link from "next/link";
import { ArrowLeft, Phone, Clock, TrendingUp } from "lucide-react";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  PAUSED: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
};

const callStatusColors: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  NO_ANSWER: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  QUEUED: "bg-gray-100 text-gray-600",
  RINGING: "bg-yellow-100 text-yellow-700",
};

// Next.js 15: params is a Promise
export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const campaign = await prisma.campaign.findFirst({
    where: { id, userId: session.user!.id },
    include: {
      contactGroup: { select: { name: true, _count: { select: { contacts: true } } } },
      calls: {
        include: { contact: { select: { name: true, phone: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      _count: { select: { calls: true } },
    },
  });

  if (!campaign) redirect("/campaigns");

  const completed = campaign.calls.filter((c) => c.status === "COMPLETED").length;
  const interested = campaign.calls.filter((c) => c.outcome === "interested").length;
  const answerRate =
    campaign._count.calls > 0
      ? Math.round((completed / campaign._count.calls) * 100)
      : 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/campaigns" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={15} /> Back to campaigns
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          <p className="text-muted-foreground mt-1">{campaign.objective || "No objective set"}</p>
          {campaign.contactGroup && (
            <p className="text-sm text-muted-foreground mt-1">
              Contact group: <span className="font-medium text-foreground">{campaign.contactGroup.name}</span>
              {" "}({campaign.contactGroup._count.contacts} contacts)
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${statusColors[campaign.status]}`}>
            {campaign.status}
          </span>
          {(campaign.status === "DRAFT" || campaign.status === "PAUSED") && (
            <StartCampaignButton campaignId={campaign.id} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Calls", value: campaign._count.calls, icon: Phone },
          { label: "Completed", value: completed, icon: Clock },
          { label: "Answer Rate", value: `${answerRate}%`, icon: TrendingUp },
          { label: "Interested", value: interested, icon: TrendingUp },
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

      <Card>
        <CardHeader><CardTitle className="text-base">AI Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Voice</p>
              <p className="capitalize font-medium">{campaign.voice}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Created</p>
              <p className="font-medium">{new Date(campaign.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          {campaign.script && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Opening Script</p>
              <div className="bg-muted rounded-xl p-4 text-sm leading-relaxed">{campaign.script}</div>
            </div>
          )}
          {campaign.systemPrompt && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">AI Instructions</p>
              <div className="bg-muted rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap">{campaign.systemPrompt}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Calls ({campaign._count.calls})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {campaign.calls.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10 px-6">
              No calls yet. Start the campaign to begin calling contacts.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  {["Contact", "Phone", "Status", "Outcome", "Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campaign.calls.map((call) => (
                  <tr key={call.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{call.contact.name}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{call.contact.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${callStatusColors[call.status] || "bg-muted text-muted-foreground"}`}>
                        {call.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground capitalize">
                      {call.outcome?.replace(/_/g, " ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(call.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
