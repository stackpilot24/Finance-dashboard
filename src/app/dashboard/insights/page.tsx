"use client";
import { ObservationsList } from "@/components/insights/ObservationsList";
import { TopSpendingCategory } from "@/components/insights/TopSpendingCategory";
import { MonthlyComparison } from "@/components/insights/MonthlyComparison";
import { SpendingPatternChart } from "@/components/insights/SpendingPatternChart";
import dynamic from "next/dynamic";

const SpendingHeatmap = dynamic(
  () => import("@/components/dashboard/SpendingHeatmap").then((m) => m.SpendingHeatmap),
  { ssr: false, loading: () => <div className="h-48 rounded-xl bg-muted/40 animate-pulse" /> }
);

export default function InsightsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Insights</h2>
        <p className="text-muted-foreground text-sm mt-1">Understand your spending patterns and financial trends</p>
      </div>

      {/* Spending Heatmap */}
      <SpendingHeatmap />

      {/* Spending pattern trend + category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <SpendingPatternChart />
        </div>
        <div className="lg:col-span-2">
          <TopSpendingCategory />
        </div>
      </div>

      {/* Month-by-month full comparison */}
      <MonthlyComparison />

      {/* Key observations */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Key Observations</h3>
        <ObservationsList />
      </div>
    </div>
  );
}
