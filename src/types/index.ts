export type TransactionType = "income" | "expense";

export type Category =
  | "salary"
  | "freelance"
  | "investment"
  | "food"
  | "transport"
  | "housing"
  | "utilities"
  | "entertainment"
  | "health"
  | "shopping"
  | "education"
  | "other";

export type Role = "viewer" | "admin";

export type SortField = "date" | "amount" | "category";
export type SortDirection = "asc" | "desc";

export interface Transaction {
  id: string;
  date: string; // "YYYY-MM-DD"
  amount: number;
  type: TransactionType;
  category: Category;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlySummary {
  month: string; // "YYYY-MM"
  label: string; // "Jan 2025"
  income: number;
  expenses: number;
  balance: number;
}

export interface CategoryBreakdown {
  category: Category;
  label: string;
  total: number;
  percentage: number;
  transactionCount: number;
}

export interface BalanceTrendPoint {
  date: string;
  balance: number;
  income: number;
  expenses: number;
}

export interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  incomeChangePercent: number;
  expenseChangePercent: number;
  balanceChangePercent: number;
}

export interface Insight {
  id: string;
  title: string;
  value: string;
  description: string;
  sentiment: "positive" | "negative" | "neutral";
  icon: string;
}

export interface FilterState {
  search: string;
  type: TransactionType | "all";
  category: Category | "all";
  dateFrom: string | null;
  dateTo: string | null;
  sortField: SortField;
  sortDirection: SortDirection;
}

// ── Bill Reminders ────────────────────────────────────────────────────────────
export type BillFrequency = "weekly" | "monthly" | "yearly";
export type BillStatus = "overdue" | "due_today" | "upcoming" | "paid";

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // "YYYY-MM-DD"
  category: Category;
  isPaid: boolean;
  isRecurring: boolean;
  frequency?: BillFrequency;
  notes?: string;
  createdAt: string;
}

// ── Goal Tracker ──────────────────────────────────────────────────────────────
export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string; // "YYYY-MM-DD"
  category: Category;
  color: string;
  createdAt: string;
}

// ── Recurring Transactions ────────────────────────────────────────────────────
export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "yearly";

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  frequency: RecurrenceFrequency;
  startDate: string; // "YYYY-MM-DD"
  nextDueDate: string; // "YYYY-MM-DD"
  isActive: boolean;
  createdAt: string;
}

// ── Notifications ─────────────────────────────────────────────────────────────
export type NotificationType = "info" | "warning" | "success" | "error";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string; // ISO string
  isRead: boolean;
  relatedId?: string;
}

// ── Currency ──────────────────────────────────────────────────────────────────
export type CurrencyCode =
  | "INR"
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "AED"
  | "SGD"
  | "CAD"
  | "AUD"
  | "CNY";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  country: string;
  flag: string;
  locale: string;
}
