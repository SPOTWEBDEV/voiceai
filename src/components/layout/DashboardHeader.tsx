"use client";
import { signOut } from "next-auth/react";
import { LogOut, Settings, Bell, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface Props {
  user: { name?: string | null; email?: string | null };
  isAdmin?: boolean;
}

export default function DashboardHeader({ user, isAdmin }: Props) {
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-6 shrink-0">
      <div />
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
          >
            <ShieldCheck size={13} />
            Admin Panel
          </Link>
        )}
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Bell size={18} />
        </button>
        <div className="relative group">
          <button className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-400 hover:opacity-80 transition-opacity">
            {initials}
          </button>
          <div className="absolute right-0 top-10 w-52 bg-background border rounded-xl shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all z-50">
            <div className="px-3 py-2 border-b">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <div className="p-1">
              <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors">
                <Settings size={14} />Settings
              </Link>
              {isAdmin && (
                <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent text-red-600 dark:text-red-400 transition-colors">
                  <ShieldCheck size={14} />Admin Panel
                </Link>
              )}
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
