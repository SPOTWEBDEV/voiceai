"use client";
import { signOut } from "next-auth/react";
import { LogOut, ShieldCheck } from "lucide-react";

interface Props { user: { name?: string | null; email?: string | null } }

export default function AdminHeader({ user }: Props) {
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-red-500" />
        <span className="text-sm font-medium text-muted-foreground">Administrator</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
        <div className="relative group">
          <button className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-xs font-bold text-red-600 dark:text-red-400 hover:opacity-80 transition-opacity">
            {initials}
          </button>
          <div className="absolute right-0 top-10 w-48 bg-background border rounded-xl shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all z-50">
            <div className="px-3 py-2 border-b">
              <p className="text-xs font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <div className="p-1">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent text-destructive transition-colors"
              >
                <LogOut size={14} />Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
