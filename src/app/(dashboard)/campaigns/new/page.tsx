import CreateCampaignForm from "@/components/campaigns/CreateCampaignForm";

export default function NewCampaignPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Campaign</h1>
        <p className="text-muted-foreground">Configure your AI voice agent and launch calls</p>
      </div>
      <CreateCampaignForm />
    </div>
  );
}
