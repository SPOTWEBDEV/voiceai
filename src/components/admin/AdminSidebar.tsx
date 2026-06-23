"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Megaphone, Phone,
  Settings, ShieldCheck, BarChart3,
} from "lucide-react";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/calls", label: "Calls", icon: Phone },
  { href: "/admin/settings", label: "Platform Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-background flex flex-col shrink-0">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center">
            <ShieldCheck size={15} className="text-white" />
          </div>
          <span>Admin Panel</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">VoiceAI Platform</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-red-500 text-white"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
        >
          <BarChart3 size={14} />
          Switch to User Dashboard
        </Link>
      </div>
    </aside>
  );
}
