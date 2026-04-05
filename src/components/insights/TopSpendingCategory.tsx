"use client";
import { useMemo } from "react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useChartData } from "@/hooks/useChartData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_COLORS, formatCurrency } from "@/lib/formatters";
import { useCurrencyStore, CURRENCIES } from "@/store/useCurrencyStore";
import { EmptyState } from "@/components/shared/EmptyState";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function TopSpendingCategory() {
  const { spendingBreakdown, monthlySummaries } = useChartData();
  const transactions = useTransactionStore((s) => s.transactions);
  const { selectedCurrency, convertFromINR } = useCurrencyStore();
  const currencyInfo = CURRENCIES[selectedCurrency];
  const top6 = spendingBreakdown.slice(0, 6);

  // Per-category spending for current and previous month
  const monthlyTrend = useMemo(() => {
    const months = monthlySummaries.map((m) => m.month);
    const curr = months[months.length - 1];
    const prev = months[months.length - 2];
    const map: Record<string, { curr: number; prev: number }> = {};
    for (const t of transactions.filter((t) => t.type === "expense")) {
      if (!map[t.category]) map[t.category] = { curr: 0, prev: 0 };
      if (curr && t.date.startsWith(curr)) map[t.category].curr += t.amount;
      if (prev && t.date.startsWith(prev)) map[t.category].prev += t.amount;
    }
    return map;
  }, [transactions, monthlySummaries]);

  if (top6.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Top Spending Categories</CardTitle></CardHeader>
        <CardContent><EmptyState title="No expense data" description="Add expense transactions to see categories." /></CardContent>
      </Card>
    );
  }

  const maxTotal = top6[0]?.total || 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">Top Spending Categories</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">By total amount spent — all time</p>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{top6.length} categories</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {top6.map((item, i) => {
          const trend = monthlyTrend[item.category];
          const hasTrend = trend && trend.prev > 0;
          const pct = hasTrend ? ((trend.curr - trend.prev) / trend.prev) * 100 : 0;
          const color = CATEGORY_COLORS[item.category] || "#6b7280";

          return (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className={cn("font-medium truncate", i === 0 ? "text-base" : "text-sm")}>{item.label}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{item.transactionCount} txn{item.transactionCount !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {hasTrend && Math.abs(pct) >= 0.5 ? (
                    <span className={cn(
                      "flex items-center gap-0.5 text-xs font-medium",
                      pct > 0 ? "text-red-500" : "text-emerald-500"
                    )}>
                      {pct > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(pct).toFixed(0)}%
                    </span>
                  ) : hasTrend ? (
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Minus className="h-3 w-3" />
                    </span>
                  ) : null}
                  <div className="text-right">
                    <span className="text-sm font-semibold">{formatCurrency(convertFromINR(item.total), false, selectedCurrency, currencyInfo.locale)}</span>
                    <span className="text-xs text-muted-foreground ml-1.5">{item.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(item.total / maxTotal) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 + 0.2, duration: 0.7, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
