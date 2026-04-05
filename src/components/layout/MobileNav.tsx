"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, Lightbulb, Receipt, Target, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/transactions", label: "Txns", icon: ArrowLeftRight },
  { href: "/dashboard/bills", label: "Bills", icon: Receipt },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/recurring", label: "Recurring", icon: RotateCcw },
  { href: "/dashboard/insights", label: "Insights", icon: Lightbulb },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-card border-t border-border overflow-x-auto">
      <div className="flex h-full items-center min-w-max px-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors min-w-[60px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
