"use client";
import { useMemo } from "react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { getBalanceTrend, getCategoryBreakdown, getMonthlySummaries } from "@/lib/computeInsights";

export function useChartData() {
  const transactions = useTransactionStore((s) => s.transactions);

  const balanceTrend = useMemo(() => getBalanceTrend(transactions), [transactions]);
  const spendingBreakdown = useMemo(() => getCategoryBreakdown(transactions), [transactions]);
  const monthlySummaries = useMemo(() => getMonthlySummaries(transactions), [transactions]);

  return { balanceTrend, spendingBreakdown, monthlySummaries };
}
