"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Megaphone,
  Phone, BarChart3, Settings, Zap,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/contacts", label: "Contacts", icon: Users, exact: false },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone, exact: false },
  { href: "/calls", label: "Calls", icon: Phone, exact: false },
  { href: "/analytics", label: "Analytics", icon: BarChart3, exact: false },
  { href: "/settings", label: "Settings", icon: Settings, exact: false },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-background flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          VoiceAI
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer hint */}
      <div className="p-4 border-t">
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
          <p className="text-xs font-semibold text-violet-700 dark:text-violet-400">MVP Mode</p>
          <p className="text-xs text-muted-foreground mt-0.5">Billing & teams coming soon</p>
        </div>
      </div>
    </aside>
  );
}
