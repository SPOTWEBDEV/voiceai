import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    select: {
      name: true, email: true,
      openrouterModel: true,
      smtpHost: true, smtpPort: true, smtpUser: true, smtpPass: true, smtpFrom: true,
    },
  });

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 px-4 sm:px-6 py-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account, AI model, and messaging configuration</p>
      </div>
      <SettingsForm user={user as any} />
    </div>
  );
}
