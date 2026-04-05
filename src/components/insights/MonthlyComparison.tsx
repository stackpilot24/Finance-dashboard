"use client";
import { useChartData } from "@/hooks/useChartData";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { useCurrencyStore, CURRENCIES } from "@/store/useCurrencyStore";
import { EmptyState } from "@/components/shared/EmptyState";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

function CustomTooltip({ active, payload, label, code, locale }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; fill: string }>;
  label?: string;
  code: string;
  locale: string;
}) {
  if (!active || !payload?.length) return null;
  const income = payload.find(p => p.name === "Income")?.value ?? 0;
  const expenses = payload.find(p => p.name === "Expenses")?.value ?? 0;
  const savings = income - expenses;
  return (
    <div className="rounded-lg border bg-card p-3 shadow-lg text-sm min-w-[180px]">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex justify-between gap-4 py-0.5" style={{ color: p.fill }}>
          <span>{p.name}</span>
          <span className="font-medium">{formatCurrency(p.value, false, code, locale)}</span>
        </p>
      ))}
      <div className="border-t mt-2 pt-2 flex justify-between text-xs text-muted-foreground">
        <span>Net</span>
        <span className={cn("font-semibold", savings >= 0 ? "text-emerald-500" : "text-red-500")}>
          {formatCurrency(savings, true, code, locale)}
        </span>
      </div>
    </div>
  );
}

function MomBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return <span className="text-xs text-muted-foreground">—</span>;
  const pct = ((current - previous) / previous) * 100;
  if (Math.abs(pct) < 0.5) return <span className="flex items-center gap-0.5 text-xs text-muted-foreground"><Minus className="h-3 w-3" />0%</span>;
  const up = pct > 0;
  return (
    <span className={cn("flex items-center gap-0.5 text-xs font-medium", up ? "text-red-500" : "text-emerald-500")}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(pct).toFixed(0)}%
    </span>
  );
}

export function MonthlyComparison() {
  const { monthlySummaries } = useChartData();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { selectedCurrency, convertFromINR } = useCurrencyStore();
  const currencyInfo = CURRENCIES[selectedCurrency];
  const gridColor = isDark ? "#2d3748" : "#e2e8f0";
  const textColor = isDark ? "#a0aec0" : "#718096";

  const allMonths = monthlySummaries.map((m, i) => ({
    ...m,
    income: convertFromINR(m.income),
    expenses: convertFromINR(m.expenses),
    balance: convertFromINR(m.balance),
    savingsRate: m.income > 0 ? ((m.income - m.expenses) / m.income) * 100 : 0,
    prevExpenses: i > 0 ? convertFromINR(monthlySummaries[i - 1].expenses) : 0,
  }));

  if (allMonths.length < 2) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Monthly Comparison</CardTitle></CardHeader>
        <CardContent><EmptyState title="Not enough data" description="Need at least 2 months of data for comparison." /></CardContent>
      </Card>
    );
  }

  // Show last 6 in chart, all in table
  const chartData = allMonths.slice(-6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-4"
    >
      {/* Bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Comparison</CardTitle>
          <p className="text-xs text-muted-foreground">Income vs expenses — last {chartData.length} months</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: textColor, fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fill: textColor, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${currencyInfo.symbol}${(v / 1000).toFixed(0)}k`}
                width={45}
              />
              <Tooltip content={<CustomTooltip code={selectedCurrency} locale={currencyInfo.locale} />} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
              <ReferenceLine y={0} stroke={gridColor} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Month-by-month table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Month-by-Month Breakdown</CardTitle>
          <p className="text-xs text-muted-foreground">All recorded months with savings rate and expense trend</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Month</th>
                  <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground">Income</th>
                  <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground">Expenses</th>
                  <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">vs Prior</th>
                  <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground">Net</th>
                  <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">Savings %</th>
                </tr>
              </thead>
              <tbody>
                {[...allMonths].reverse().map((m, i) => (
                  <motion.tr
                    key={m.month}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-medium">{m.label}</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatCurrency(m.income, false, selectedCurrency, currencyInfo.locale)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-red-500 font-medium">
                      {formatCurrency(m.expenses, false, selectedCurrency, currencyInfo.locale)}
                    </td>
                    <td className="py-2.5 px-4 text-right hidden sm:table-cell">
                      <MomBadge current={m.expenses} previous={m.prevExpenses} />
                    </td>
                    <td className={cn("py-2.5 px-4 text-right font-semibold", m.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
                      {formatCurrency(m.balance, true, selectedCurrency, currencyInfo.locale)}
                    </td>
                    <td className="py-2.5 px-4 text-right hidden sm:table-cell">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        m.savingsRate > 20
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                          : m.savingsRate > 0
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                      )}>
                        {m.savingsRate.toFixed(0)}%
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
