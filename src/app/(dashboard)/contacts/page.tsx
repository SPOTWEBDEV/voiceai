import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ContactGroupsClient from "@/components/contacts/ContactGroupsClient";

export default async function ContactsPage() {
  const session = await auth();

  const groups = await prisma.contactGroup.findMany({
    where: { userId: session!.user!.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { contacts: true } },
      contacts: {
        orderBy: { createdAt: "desc" },
        take: 500,
      },
    },
  });

  return <ContactGroupsClient initialGroups={groups as any} />;
}
