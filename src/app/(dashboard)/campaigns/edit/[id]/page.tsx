import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateCampaignForm from "@/components/campaigns/CreateCampaignForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditCampaignPage({
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
      contactGroups: {
        include: { contactGroup: { select: { id: true, name: true } } },
      },
    },
  });

  if (!campaign) redirect("/campaigns");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={15} /> Back to campaigns
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Edit Campaign</h1>
        <p className="text-muted-foreground">Update your campaign settings</p>
      </div>
      <CreateCampaignForm campaign={campaign as any} />
    </div>
  );
}
