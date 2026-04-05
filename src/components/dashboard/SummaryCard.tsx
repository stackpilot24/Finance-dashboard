"use client";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { useCurrencyStore, CURRENCIES } from "@/store/useCurrencyStore";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: number;
  changePercent: number;
  icon: React.ReactNode;
  colorClass: string;
  index: number;
}

export function SummaryCard({ title, value, changePercent, icon, colorClass, index }: SummaryCardProps) {
  const isPositive = changePercent > 0;
  const isNegative = changePercent < 0;
  const { selectedCurrency, convertFromINR } = useCurrencyStore();
  const currencyInfo = CURRENCIES[selectedCurrency];
  const convertedValue = convertFromINR(value);
  const currencyFormatter = (v: number) => formatCurrency(v, false, selectedCurrency, currencyInfo.locale);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <p className="text-2xl font-bold mt-1 tabular-nums">
                <AnimatedNumber value={convertedValue} formatter={currencyFormatter} />
              </p>
            </div>
            <div className={cn("p-2.5 rounded-xl", colorClass)}>
              {icon}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            ) : isNegative ? (
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            ) : (
              <Minus className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                isPositive ? "text-emerald-500" : isNegative ? "text-red-500" : "text-muted-foreground"
              )}
            >
              {formatPercent(changePercent)}
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
