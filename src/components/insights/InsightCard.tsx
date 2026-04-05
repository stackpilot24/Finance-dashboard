"use client";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Insight } from "@/types";
import { TrendingUp, TrendingDown, DollarSign, BarChart2, Wallet, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ReactNode> = {
  TrendingUp: <TrendingUp className="h-5 w-5" />,
  TrendingDown: <TrendingDown className="h-5 w-5" />,
  DollarSign: <DollarSign className="h-5 w-5" />,
  BarChart2: <BarChart2 className="h-5 w-5" />,
  Wallet: <Wallet className="h-5 w-5" />,
  PiggyBank: <PiggyBank className="h-5 w-5" />,
};

interface InsightCardProps {
  insight: Insight;
  index: number;
}

export function InsightCard({ insight, index }: InsightCardProps) {
  const sentimentClasses = {
    positive: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    negative: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    neutral: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Card className="h-full">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-xl flex-shrink-0", sentimentClasses[insight.sentiment])}>
              {ICONS[insight.icon] || <TrendingUp className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium">{insight.title}</p>
              <p className="text-xl font-bold mt-0.5 truncate">{insight.value}</p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{insight.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
