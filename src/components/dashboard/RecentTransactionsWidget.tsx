"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useCurrencyStore, CURRENCIES } from "@/store/useCurrencyStore";
import { formatCurrency, CATEGORY_LABELS } from "@/lib/formatters";

export function RecentTransactionsWidget() {
  const transactions = useTransactionStore((s) => s.transactions);
  const { selectedCurrency, convertFromINR } = useCurrencyStore();
  const currencyInfo = CURRENCIES[selectedCurrency];

  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold">Recent Transactions</CardTitle>
        <Link href="/dashboard/transactions">
          <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-muted-foreground">
            View all <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 space-y-1">
        {recent.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${t.type === "income" ? "bg-emerald-100 dark:bg-emerald-950/40" : "bg-red-100 dark:bg-red-950/40"}`}>
              {t.type === "income"
                ? <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                : <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{t.description}</p>
              <p className="text-[10px] text-muted-foreground">{CATEGORY_LABELS[t.category]}</p>
            </div>
            <span className={`text-xs font-semibold shrink-0 ${t.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
              {t.type === "income" ? "+" : "-"}{formatCurrency(convertFromINR(t.amount), false, selectedCurrency, currencyInfo.locale)}
            </span>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
