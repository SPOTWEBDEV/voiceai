import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CallsTable from "@/components/calls/CallsTable";

export default async function CallsPage() {
  const session = await auth();
  const calls = await prisma.call.findMany({
    where: { userId: session!.user!.id },
    include: {
      contact: { select: { name: true, phone: true } },
      campaign: { select: { name: true } },
      transcripts: { orderBy: { timestamp: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calls</h1>
        <p className="text-muted-foreground">Review all calls, transcripts, and AI summaries</p>
      </div>
      <CallsTable calls={calls as any} />
    </div>
  );
}
