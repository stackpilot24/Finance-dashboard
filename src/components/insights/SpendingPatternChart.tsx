"use client";
import { useMemo } from "react";
import { useTheme } from "next-themes";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useCurrencyStore, CURRENCIES } from "@/store/useCurrencyStore";
import { getCategoryMonthlyTrend } from "@/lib/computeInsights";
import { formatCurrency } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

function CustomTooltip({
  active, payload, label, code, locale,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  code: string;
  locale: string;
}) {
  if (!active || !payload?.length) return null;
  const nonZero = payload.filter((p) => p.value > 0);
  if (nonZero.length === 0) return null;
  return (
    <div className="rounded-lg border bg-card p-3 shadow-lg text-sm min-w-[160px]">
      <p className="font-semibold mb-2 text-foreground">{label}</p>
      {nonZero.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
            <span className="text-muted-foreground">{p.name}</span>
          </span>
          <span className="font-medium text-foreground">{formatCurrency(p.value, false, code, locale)}</span>
        </div>
      ))}
    </div>
  );
}

export function SpendingPatternChart() {
  const transactions = useTransactionStore((s) => s.transactions);
  const { selectedCurrency, convertFromINR } = useCurrencyStore();
  const currencyInfo = CURRENCIES[selectedCurrency];
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const gridColor = isDark ? "#2d3748" : "#e2e8f0";
  const textColor = isDark ? "#a0aec0" : "#718096";

  const trend = useMemo(() => getCategoryMonthlyTrend(transactions, 5), [transactions]);

  // Build recharts-compatible data array
  const chartData = useMemo(() => {
    return trend.labels.map((label, i) => {
      const row: Record<string, string | number> = { label };
      trend.series.forEach((s) => {
        row[s.name] = convertFromINR(s.data[i]);
      });
      return row;
    });
  }, [trend, convertFromINR]);

  if (chartData.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Spending Patterns by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState title="Not enough data" description="Need at least 2 months of transactions." />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Spending Patterns by Category</CardTitle>
          <p className="text-xs text-muted-foreground">Monthly expense trends for your top 5 categories</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: textColor, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: textColor, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${currencyInfo.symbol}${(v / 1000).toFixed(0)}k`}
                width={45}
              />
              <Tooltip content={<CustomTooltip code={selectedCurrency} locale={currencyInfo.locale} />} />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                iconType="circle"
                iconSize={8}
              />
              {trend.series.map((s) => (
                <Line
                  key={s.name}
                  type="monotone"
                  dataKey={s.name}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
