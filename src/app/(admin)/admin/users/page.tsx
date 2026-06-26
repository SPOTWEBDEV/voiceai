import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminUserActions from "@/components/admin/AdminUserActions";

export default async function AdminUsersPage() {
  // Only show non-admin users
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          campaigns: true,
          calls: true,
          contactGroups: true,  // correct relation name
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">{users.length} registered users</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">All Users</CardTitle></CardHeader>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-10">No users yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  {["User", "Contact Groups", "Campaigns", "Calls", "Joined", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={user.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{user.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user._count.contactGroups}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user._count.campaigns}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user._count.calls}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <AdminUserActions userId={user.id} currentRole={user.role} />
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
