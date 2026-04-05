"use client";
import { useMemo } from "react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { getDashboardSummary } from "@/lib/computeInsights";

export function useSummary() {
  const transactions = useTransactionStore((s) => s.transactions);
  return useMemo(() => getDashboardSummary(transactions), [transactions]);
}
