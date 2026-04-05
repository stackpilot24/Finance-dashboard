import { Transaction } from "@/types";
import { CATEGORY_LABELS } from "./formatters";

export function toCSV(transactions: Transaction[]): string {
  const headers = ["Date", "Description", "Category", "Type", "Amount"];
  const rows = transactions.map((t) => [
    t.date,
    `"${t.description.replace(/"/g, '""')}"`,
    CATEGORY_LABELS[t.category] || t.category,
    t.type,
    t.amount.toFixed(2),
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function toJSON(transactions: Transaction[]): string {
  return JSON.stringify(
    transactions.map((t) => ({
      id: t.id,
      date: t.date,
      description: t.description,
      category: CATEGORY_LABELS[t.category] || t.category,
      type: t.type,
      amount: t.amount,
    })),
    null,
    2
  );
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
