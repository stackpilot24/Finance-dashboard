"use client";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { RoleSwitcher } from "@/components/shared/RoleSwitcher";
import { ExportMenu } from "@/components/shared/ExportMenu";
import { CurrencySelector } from "@/components/shared/CurrencySelector";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useNotificationEngine } from "@/hooks/useNotificationEngine";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { TrendingUp } from "lucide-react";
import { useEffect } from "react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/transactions": "Transactions",
  "/dashboard/insights": "Insights",
  "/dashboard/bills": "Bills",
  "/dashboard/goals": "Goals",
  "/dashboard/recurring": "Recurring",
};

export function Topbar() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || "Dashboard";
  const fetchRates = useCurrencyStore((s) => s.fetchRates);
  useNotificationEngine();
  useEffect(() => { fetchRates(); }, [fetchRates]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b border-border bg-background/95 backdrop-blur px-4 md:px-6 w-full overflow-x-hidden">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-base tracking-tight">Zorvyn</span>
      </div>

      {/* Page title — desktop */}
      <h1 className="hidden md:block text-lg font-semibold">{title}</h1>

      <div className="flex items-center gap-1.5 ml-auto">
        <div className="hidden sm:flex items-center gap-1.5">
          <CurrencySelector />
          <ExportMenu />
          <RoleSwitcher />
        </div>
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  );
}
