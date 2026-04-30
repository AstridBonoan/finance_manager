"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Camera, Home, List, PieChart } from "lucide-react";

const tabs = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/budget", label: "Budget", icon: PieChart },
  { href: "/scan", label: "Scan", icon: Camera, primary: true },
  { href: "/ledger", label: "Ledger", icon: List },
  { href: "/insights", label: "Insights", icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();
  if (pathname === "/onboarding") {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-end justify-between px-3 pb-2 pt-1">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;

          if (tab.primary) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`-mt-6 flex h-14 w-14 items-center justify-center rounded-full shadow-md transition ${
                  active ? "bg-emerald-700 text-white" : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
                aria-label={tab.label}
              >
                <Icon size={22} />
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex w-16 flex-col items-center gap-1 py-2 text-xs font-medium transition ${
                active ? "text-emerald-700" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
