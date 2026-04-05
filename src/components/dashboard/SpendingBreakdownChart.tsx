"use client";
import { useChartData } from "@/hooks/useChartData";
import { useFilterStore } from "@/store/useFilterStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CATEGORY_COLORS } from "@/lib/formatters";
import { formatCurrency } from "@/lib/formatters";
import { useCurrencyStore, CURRENCIES } from "@/store/useCurrencyStore";
import { EmptyState } from "@/components/shared/EmptyState";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Category } from "@/types";

function CustomTooltip({ active, payload, code, locale }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { percentage: number } }>; code: string; locale: string }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border bg-card p-3 shadow-lg text-sm">
      <p className="font-semibold">{p.name}</p>
      <p className="text-muted-foreground">{formatCurrency(p.value, false, code, locale)}</p>
      <p className="text-muted-foreground">{p.payload.percentage.toFixed(1)}%</p>
    </div>
  );
}

export function SpendingBreakdownChart() {
  const { spendingBreakdown } = useChartData();
  const setCategory = useFilterStore((s) => s.setCategory);
  const router = useRouter();
  const { selectedCurrency, convertFromINR } = useCurrencyStore();
  const currencyInfo = CURRENCIES[selectedCurrency];

  const top6 = spendingBreakdown.slice(0, 6).map((item) => ({
    ...item,
    total: convertFromINR(item.total),
  }));

  if (top6.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Spending Breakdown</CardTitle></CardHeader>
        <CardContent><EmptyState title="No expense data" description="Add expense transactions to see your spending breakdown." /></CardContent>
      </Card>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (entry: any) => {
    if (entry?.category) {
      setCategory(entry.category as Category);
      router.push("/dashboard/transactions");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Spending Breakdown</CardTitle>
          <p className="text-xs text-muted-foreground">Click a slice to filter transactions</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={top6}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="80%"
                dataKey="total"
                nameKey="label"
                paddingAngle={3}
                onClick={handleClick}
                style={{ cursor: "pointer" }}
              >
                {top6.map((entry) => (
                  <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] || "#6b7280"} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip code={selectedCurrency} locale={currencyInfo.locale} />} />
              <Legend
                formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
