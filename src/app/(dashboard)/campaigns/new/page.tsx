import CreateCampaignForm from "@/components/campaigns/CreateCampaignForm";

export default function NewCampaignPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Campaign</h1>
        <p className="text-muted-foreground">Choose your channel — Voice Call, SMS, or Email — then configure and launch</p>
      </div>
      <CreateCampaignForm />
    </div>
  );
}
