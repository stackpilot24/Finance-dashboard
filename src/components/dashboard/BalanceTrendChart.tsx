"use client";
import { useChartData } from "@/hooks/useChartData";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { useCurrencyStore, CURRENCIES } from "@/store/useCurrencyStore";
import { EmptyState } from "@/components/shared/EmptyState";
import { motion } from "framer-motion";

function CustomTooltip({ active, payload, label, symbol, code, locale }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string; symbol: string; code: string; locale: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card p-3 shadow-lg text-sm">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-medium">{formatCurrency(p.value, false, code, locale)}</span>
        </p>
      ))}
    </div>
  );
}

export function BalanceTrendChart() {
  const { balanceTrend } = useChartData();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { selectedCurrency, convertFromINR } = useCurrencyStore();
  const currencyInfo = CURRENCIES[selectedCurrency];

  const convertedTrend = balanceTrend.map((p) => ({
    ...p,
    balance: convertFromINR(p.balance),
    income: convertFromINR(p.income),
    expenses: convertFromINR(p.expenses),
  }));

  const gridColor = isDark ? "#2d3748" : "#e2e8f0";
  const textColor = isDark ? "#a0aec0" : "#718096";

  if (balanceTrend.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Balance Trend</CardTitle></CardHeader>
        <CardContent><EmptyState title="No data" description="Add transactions to see your balance trend." /></CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Balance Trend</CardTitle>
          <p className="text-xs text-muted-foreground">Cumulative balance over time</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={convertedTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fill: textColor, fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: textColor, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${currencyInfo.symbol}${(v / 1000).toFixed(0)}k`} width={45} />
              <Tooltip content={<CustomTooltip symbol={currencyInfo.symbol} code={selectedCurrency} locale={currencyInfo.locale} />} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
              <Area type="monotone" dataKey="balance" name="Balance" stroke="#6366f1" strokeWidth={2} fill="url(#balanceGrad)" />
              <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" strokeDasharray="5 3" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
