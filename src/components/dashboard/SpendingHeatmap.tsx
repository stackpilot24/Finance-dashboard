"use client";
import { useMemo, useState } from "react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useCurrencyStore, CURRENCIES } from "@/store/useCurrencyStore";
import { getDailySpendingMap } from "@/lib/computeInsights";
import { formatCurrency } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKS = 52;
const CELL = 13;
const GAP = 2;
const LABEL_W = 28;

function getColor(amount: number, max: number): string {
  if (amount === 0) return "var(--heatmap-empty, #f1f5f9)";
  const intensity = amount / max;
  if (intensity < 0.25) return "#e0e7ff";
  if (intensity < 0.5)  return "#a5b4fc";
  if (intensity < 0.75) return "#6366f1";
  return "#4338ca";
}

export function SpendingHeatmap() {
  const transactions = useTransactionStore((s) => s.transactions);
  const { selectedCurrency, convertFromINR } = useCurrencyStore();
  const currencyInfo = CURRENCIES[selectedCurrency];
  const [tooltip, setTooltip] = useState<{ date: string; amount: number; x: number; y: number } | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const { grid, maxAmount } = useMemo(() => {
    const dailyMap = getDailySpendingMap(transactions);
    const maxAmount = Math.max(...Object.values(dailyMap), 1);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = (today.getDay() + 6) % 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayOfWeek - (WEEKS - 1) * 7);

    const grid: { date: string; amount: number }[][] = [];
    const cursor = new Date(startDate);
    for (let w = 0; w < WEEKS; w++) {
      const week: { date: string; amount: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = cursor.toISOString().split("T")[0];
        week.push({ date: dateStr, amount: dailyMap[dateStr] ?? 0 });
        cursor.setDate(cursor.getDate() + 1);
      }
      grid.push(week);
    }
    return { grid, maxAmount };
  }, [transactions]);

  const monthLabels = useMemo(() => {
    const labels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    grid.forEach((week, wi) => {
      const month = new Date(week[0].date + "T00:00:00").getMonth();
      if (month !== lastMonth) {
        labels.push({
          label: new Date(week[0].date + "T00:00:00").toLocaleString("default", { month: "short" }),
          weekIndex: wi,
        });
        lastMonth = month;
      }
    });
    return labels;
  }, [grid]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Spending Heatmap</CardTitle>
        <p className="text-xs text-muted-foreground">Daily expense intensity over the past year</p>
      </CardHeader>
      <CardContent className="overflow-x-auto pb-4">
        <div className="relative inline-flex flex-col gap-1 min-w-max">
          {/* Month labels */}
          <div className="flex" style={{ paddingLeft: LABEL_W }}>
            {grid.map((week, wi) => {
              const lbl = monthLabels.find((m) => m.weekIndex === wi);
              return (
                <div key={wi} style={{ width: CELL + GAP }} className="text-[10px] text-muted-foreground overflow-visible whitespace-nowrap">
                  {lbl ? lbl.label : ""}
                </div>
              );
            })}
          </div>

          {/* Grid */}
          <div className="flex gap-0">
            {/* Day labels */}
            <div className="flex flex-col" style={{ width: LABEL_W, gap: GAP }}>
              {DAYS.map((d, i) => (
                <div key={d} style={{ height: CELL, lineHeight: `${CELL}px` }}
                  className={`text-[10px] text-muted-foreground text-right pr-1.5 ${i % 2 === 0 ? "invisible" : ""}`}>
                  {d}
                </div>
              ))}
            </div>
            {/* Cells — plain divs, no motion */}
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                {week.map((cell, di) => {
                  const isFuture = cell.date > todayStr;
                  return (
                    <div
                      key={di}
                      style={{
                        width: CELL, height: CELL,
                        marginLeft: GAP / 2, marginRight: GAP / 2,
                        borderRadius: 2,
                        backgroundColor: isFuture ? "transparent" : getColor(cell.amount, maxAmount),
                        cursor: cell.amount > 0 ? "pointer" : "default",
                        transition: "opacity 0.15s, transform 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (cell.amount > 0)
                          setTooltip({ date: cell.date, amount: cell.amount, x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-2 pl-7">
            <span className="text-[10px] text-muted-foreground">Less</span>
            {["#f1f5f9", "#e0e7ff", "#a5b4fc", "#6366f1", "#4338ca"].map((c) => (
              <div key={c} style={{ width: CELL, height: CELL, borderRadius: 2, backgroundColor: c }} />
            ))}
            <span className="text-[10px] text-muted-foreground">More</span>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div className="fixed z-50 pointer-events-none bg-popover border rounded-lg shadow-lg px-3 py-2 text-xs"
            style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}>
            <p className="font-semibold">{tooltip.date}</p>
            <p className="text-muted-foreground">
              {formatCurrency(convertFromINR(tooltip.amount), false, selectedCurrency, currencyInfo.locale)} spent
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
