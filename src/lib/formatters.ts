export function formatCurrency(
  amount: number,
  showSign = false,
  currencyCode = "INR",
  locale = "en-IN"
): string {
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  if (showSign && amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatMonthYear(dateStr: string): string {
  const [year, month] = dateStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date);
}

export function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export const CATEGORY_LABELS: Record<string, string> = {
  salary: "Salary",
  freelance: "Freelance",
  investment: "Investment",
  food: "Food & Dining",
  transport: "Transport",
  housing: "Housing",
  utilities: "Utilities",
  entertainment: "Entertainment",
  health: "Health",
  shopping: "Shopping",
  education: "Education",
  other: "Other",
};

export const CATEGORY_COLORS: Record<string, string> = {
  salary: "#6366f1",
  freelance: "#8b5cf6",
  investment: "#a78bfa",
  food: "#f59e0b",
  transport: "#3b82f6",
  housing: "#ef4444",
  utilities: "#06b6d4",
  entertainment: "#ec4899",
  health: "#10b981",
  shopping: "#f97316",
  education: "#14b8a6",
  other: "#6b7280",
};
