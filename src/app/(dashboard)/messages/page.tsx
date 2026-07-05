import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MessagesTable from "@/components/messages/MessagesTable";

export default async function MessagesPage() {
  const session = await auth();
  const messages = await prisma.message.findMany({
    where: { userId: session!.user!.id },
    include: {
      contact: { select: { name: true, phone: true, email: true } },
      campaign: { select: { name: true, channelType: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">All SMS and email messages sent across your campaigns</p>
      </div>
      <MessagesTable messages={messages as any} />
    </div>
  );
}
