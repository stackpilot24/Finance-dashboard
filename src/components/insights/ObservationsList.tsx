"use client";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useCurrencyStore, CURRENCIES } from "@/store/useCurrencyStore";
import { useMemo } from "react";
import { generateInsights } from "@/lib/computeInsights";
import { formatCurrency } from "@/lib/formatters";
import { InsightCard } from "./InsightCard";
import { EmptyState } from "@/components/shared/EmptyState";

export function ObservationsList() {
  const transactions = useTransactionStore((s) => s.transactions);
  const { selectedCurrency, convertFromINR } = useCurrencyStore();
  const currencyInfo = CURRENCIES[selectedCurrency];

  const fmt = (amount: number) =>
    formatCurrency(convertFromINR(amount), false, selectedCurrency, currencyInfo.locale);

  const insights = useMemo(
    () => generateInsights(transactions, fmt),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions, selectedCurrency]
  );

  if (insights.length === 0) {
    return <EmptyState title="No insights yet" description="Add transactions to generate financial insights." />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {insights.map((insight, i) => (
        <InsightCard key={insight.id} insight={insight} index={i} />
      ))}
    </div>
  );
}
