import { Transaction, CategoryBreakdown, MonthlySummary, BalanceTrendPoint, Insight, DashboardSummary } from "@/types";
import { CATEGORY_LABELS, CATEGORY_COLORS, formatCurrency, formatMonthYear, formatPercent } from "./formatters";

export function getMonthlySummaries(transactions: Transaction[]): MonthlySummary[] {
  const monthMap: Record<string, MonthlySummary> = {};

  for (const t of transactions) {
    const month = t.date.substring(0, 7);
    if (!monthMap[month]) {
      monthMap[month] = { month, label: formatMonthYear(month), income: 0, expenses: 0, balance: 0 };
    }
    if (t.type === "income") monthMap[month].income += t.amount;
    else monthMap[month].expenses += t.amount;
  }

  const sorted = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));
  for (const s of sorted) {
    s.balance = s.income - s.expenses;
  }
  return sorted;
}

export function getBalanceTrend(transactions: Transaction[]): BalanceTrendPoint[] {
  const summaries = getMonthlySummaries(transactions);
  let cumulative = 0;
  return summaries.map((s) => {
    cumulative += s.balance;
    return { date: s.label, balance: cumulative, income: s.income, expenses: s.expenses };
  });
}

export function getCategoryBreakdown(transactions: Transaction[]): CategoryBreakdown[] {
  const expenses = transactions.filter((t) => t.type === "expense");
  const total = expenses.reduce((sum, t) => sum + t.amount, 0);
  const map: Record<string, { total: number; count: number }> = {};

  for (const t of expenses) {
    if (!map[t.category]) map[t.category] = { total: 0, count: 0 };
    map[t.category].total += t.amount;
    map[t.category].count++;
  }

  return Object.entries(map)
    .map(([category, { total: catTotal, count }]) => ({
      category: category as CategoryBreakdown["category"],
      label: CATEGORY_LABELS[category] || category,
      total: catTotal,
      percentage: total > 0 ? (catTotal / total) * 100 : 0,
      transactionCount: count,
    }))
    .sort((a, b) => b.total - a.total);
}

export function getDashboardSummary(transactions: Transaction[]): DashboardSummary {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

  const allIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const allExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const thisMonthTx = transactions.filter((t) => t.date.startsWith(thisMonth));
  const lastMonthTx = transactions.filter((t) => t.date.startsWith(lastMonth));

  // Fall back to last 2 months if current month has no data
  const summaries = getMonthlySummaries(transactions);
  const recentTwo = summaries.slice(-2);
  const current = recentTwo[recentTwo.length - 1] || { income: 0, expenses: 0, balance: 0 };
  const previous = recentTwo[recentTwo.length - 2] || { income: 0, expenses: 0, balance: 0 };

  const currentIncome = thisMonthTx.length > 0
    ? thisMonthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
    : current.income;
  const currentExpenses = thisMonthTx.length > 0
    ? thisMonthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
    : current.expenses;

  const prevIncome = lastMonthTx.length > 0
    ? lastMonthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
    : previous.income;
  const prevExpenses = lastMonthTx.length > 0
    ? lastMonthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
    : previous.expenses;

  const pctChange = (curr: number, prev: number) =>
    prev === 0 ? 0 : ((curr - prev) / prev) * 100;

  return {
    totalBalance: allIncome - allExpenses,
    totalIncome: allIncome,
    totalExpenses: allExpenses,
    incomeChangePercent: pctChange(currentIncome, prevIncome),
    expenseChangePercent: pctChange(currentExpenses, prevExpenses),
    balanceChangePercent: pctChange(currentIncome - currentExpenses, prevIncome - prevExpenses),
  };
}

export function generateInsights(
  transactions: Transaction[],
  fmt: (n: number) => string = formatCurrency
): Insight[] {
  if (transactions.length === 0) return [];
  const insights: Insight[] = [];

  const summaries = getMonthlySummaries(transactions);
  const breakdown = getCategoryBreakdown(transactions);
  const current = summaries[summaries.length - 1];
  const previous = summaries[summaries.length - 2];

  // Top spending category
  if (breakdown.length > 0) {
    const top = breakdown[0];
    insights.push({
      id: "top-category",
      title: "Top Spending Category",
      value: top.label,
      description: `${fmt(top.total)} total — ${top.percentage.toFixed(1)}% of all expenses`,
      sentiment: "neutral",
      icon: "TrendingUp",
    });
  }

  // Month over month expense change
  if (current && previous && previous.expenses > 0) {
    const pct = ((current.expenses - previous.expenses) / previous.expenses) * 100;
    insights.push({
      id: "mom-expenses",
      title: "Month-over-Month Expenses",
      value: formatPercent(pct),
      description: `Expenses ${pct > 0 ? "increased" : "decreased"} from ${fmt(previous.expenses)} to ${fmt(current.expenses)}`,
      sentiment: pct > 10 ? "negative" : pct < -5 ? "positive" : "neutral",
      icon: pct > 0 ? "TrendingUp" : "TrendingDown",
    });
  }

  // Savings rate
  if (current) {
    const savingsRate = current.income > 0 ? ((current.income - current.expenses) / current.income) * 100 : 0;
    insights.push({
      id: "savings-rate",
      title: "Current Month Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      description: savingsRate > 20
        ? "Great job! You're saving well above the 20% benchmark."
        : savingsRate > 0
        ? "You're in the positive, but there's room to save more."
        : "Expenses exceed income this month. Consider reviewing your budget.",
      sentiment: savingsRate > 20 ? "positive" : savingsRate > 0 ? "neutral" : "negative",
      icon: "PiggyBank",
    });
  }

  // Largest single transaction
  const largest = [...transactions].sort((a, b) => b.amount - a.amount)[0];
  if (largest) {
    insights.push({
      id: "largest-tx",
      title: "Largest Transaction",
      value: fmt(largest.amount),
      description: `${largest.description} on ${new Date(largest.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      sentiment: largest.type === "income" ? "positive" : "neutral",
      icon: "DollarSign",
    });
  }

  // Most frequent category (by count)
  const countMap: Record<string, number> = {};
  for (const t of transactions.filter((t) => t.type === "expense")) {
    countMap[t.category] = (countMap[t.category] || 0) + 1;
  }
  const mostFreqCategory = Object.entries(countMap).sort((a, b) => b[1] - a[1])[0];
  if (mostFreqCategory) {
    insights.push({
      id: "most-frequent",
      title: "Most Frequent Category",
      value: CATEGORY_LABELS[mostFreqCategory[0]] || mostFreqCategory[0],
      description: `${mostFreqCategory[1]} transactions — small amounts add up quickly`,
      sentiment: "neutral",
      icon: "BarChart2",
    });
  }

  // Income vs expenses balance
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  insights.push({
    id: "net-balance",
    title: "Overall Net Balance",
    value: fmt(netBalance),
    description: netBalance > 0
      ? `You've saved ${fmt(netBalance)} across all recorded transactions.`
      : `You've spent ${fmt(Math.abs(netBalance))} more than you've earned.`,
    sentiment: netBalance > 0 ? "positive" : "negative",
    icon: "Wallet",
  });

  return insights;
}

// Returns per-category monthly spending for top N categories (for SpendingPatternChart)
export function getCategoryMonthlyTrend(transactions: Transaction[], topN = 5) {
  const summaries = getMonthlySummaries(transactions);
  const months = summaries.map((s) => s.month);
  const labels = summaries.map((s) => s.label);
  const topCategories = getCategoryBreakdown(transactions).slice(0, topN);

  const series = topCategories.map((cat) => ({
    category: cat.category,
    name: cat.label,
    color: CATEGORY_COLORS[cat.category] || "#6b7280",
    data: months.map((month) =>
      transactions
        .filter((t) => t.type === "expense" && t.category === cat.category && t.date.startsWith(month))
        .reduce((sum, t) => sum + t.amount, 0)
    ),
  }));

  return { months, labels, series };
}

// Returns a map of "YYYY-MM-DD" -> total expenses for that day (for the spending heatmap)
export function getDailySpendingMap(transactions: Transaction[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type === "expense") {
      map[t.date] = (map[t.date] ?? 0) + t.amount;
    }
  }
  return map;
}
