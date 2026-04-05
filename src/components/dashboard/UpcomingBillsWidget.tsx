"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Receipt, AlertCircle, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBillStore } from "@/store/useBillStore";
import { useCurrencyStore, CURRENCIES } from "@/store/useCurrencyStore";
import { formatCurrency } from "@/lib/formatters";
import { getBillStatus, getDaysUntilDue } from "@/lib/billUtils";

export function UpcomingBillsWidget() {
  const bills = useBillStore((s) => s.bills);
  const { selectedCurrency, convertFromINR } = useCurrencyStore();
  const currencyInfo = CURRENCIES[selectedCurrency];

  const upcoming = bills
    .filter((b) => !b.isPaid)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const overdueCount = upcoming.filter((b) => getBillStatus(b.dueDate) === "overdue").length;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-semibold">Upcoming Bills</CardTitle>
          {overdueCount > 0 && (
            <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{overdueCount}</span>
          )}
        </div>
        <Link href="/dashboard/bills">
          <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-muted-foreground">
            View all <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground gap-2">
            <Receipt className="h-8 w-8 opacity-20" />
            <p className="text-xs">No upcoming bills</p>
          </div>
        ) : (
          upcoming.map((bill, i) => {
            const status = getBillStatus(bill.dueDate);
            const daysLeft = getDaysUntilDue(bill.dueDate);
            const isOverdue = status === "overdue";
            const isDueToday = status === "due_today";
            return (
              <motion.div key={bill.id} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className={`flex items-center justify-between p-2.5 rounded-lg ${isOverdue ? "bg-red-50 dark:bg-red-950/20" : isDueToday ? "bg-amber-50 dark:bg-amber-950/20" : "bg-muted/40"}`}>
                <div className="flex items-center gap-2 min-w-0">
                  {isOverdue || isDueToday
                    ? <AlertCircle className={`h-3.5 w-3.5 shrink-0 ${isOverdue ? "text-red-500" : "text-amber-500"}`} />
                    : <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{bill.name}</p>
                    <p className={`text-[10px] ${isOverdue ? "text-red-500" : "text-muted-foreground"}`}>
                      {isOverdue ? `${Math.abs(daysLeft)}d overdue` : isDueToday ? "Due today" : `${daysLeft}d left`}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold shrink-0 ml-2">
                  {formatCurrency(convertFromINR(bill.amount), false, selectedCurrency, currencyInfo.locale)}
                </span>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
