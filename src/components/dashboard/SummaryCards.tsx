"use client";
import { useSummary } from "@/hooks/useSummary";
import { SummaryCard } from "./SummaryCard";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

export function SummaryCards() {
  const summary = useSummary();

  const cards = [
    {
      title: "Total Balance",
      value: summary.totalBalance,
      changePercent: summary.balanceChangePercent,
      icon: <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      colorClass: "bg-blue-100 dark:bg-blue-900/40",
    },
    {
      title: "Total Income",
      value: summary.totalIncome,
      changePercent: summary.incomeChangePercent,
      icon: <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      colorClass: "bg-emerald-100 dark:bg-emerald-900/40",
    },
    {
      title: "Total Expenses",
      value: summary.totalExpenses,
      changePercent: summary.expenseChangePercent,
      icon: <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />,
      colorClass: "bg-red-100 dark:bg-red-900/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <SummaryCard key={card.title} {...card} index={i} />
      ))}
    </div>
  );
}
