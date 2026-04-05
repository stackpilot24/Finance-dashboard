"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Target, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGoalStore } from "@/store/useGoalStore";
import { useCurrencyStore, CURRENCIES } from "@/store/useCurrencyStore";
import { formatCurrency } from "@/lib/formatters";

export function GoalsWidget() {
  const goals = useGoalStore((s) => s.goals);
  const { selectedCurrency, convertFromINR } = useCurrencyStore();
  const currencyInfo = CURRENCIES[selectedCurrency];

  const topGoals = goals.slice(0, 3);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-semibold">Goals</CardTitle>
        </div>
        <Link href="/dashboard/goals">
          <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-muted-foreground">
            View all <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {topGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground gap-2">
            <Target className="h-8 w-8 opacity-20" />
            <p className="text-xs">No goals yet</p>
          </div>
        ) : (
          topGoals.map((goal, i) => {
            const pct = Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100);
            return (
              <motion.div key={goal.id} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium truncate">{goal.name}</span>
                  <span className="font-semibold shrink-0 ml-2" style={{ color: goal.color }}>{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: goal.color }}
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }} />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {formatCurrency(convertFromINR(goal.savedAmount), false, selectedCurrency, currencyInfo.locale)} / {formatCurrency(convertFromINR(goal.targetAmount), false, selectedCurrency, currencyInfo.locale)}
                </p>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
