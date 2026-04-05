"use client";
import { useMemo, useState } from "react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useFilterStore } from "@/store/useFilterStore";

const PAGE_SIZE = 15;

export function useFilteredTransactions() {
  const transactions = useTransactionStore((s) => s.transactions);
  const { search, type, category, dateFrom, dateTo, sortField, sortDirection } = useFilterStore();
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...transactions];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.amount.toString().includes(q)
      );
    }
    if (type !== "all") result = result.filter((t) => t.type === type);
    if (category !== "all") result = result.filter((t) => t.category === category);
    if (dateFrom) result = result.filter((t) => t.date >= dateFrom);
    if (dateTo) result = result.filter((t) => t.date <= dateTo);

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = a.date.localeCompare(b.date);
      else if (sortField === "amount") cmp = a.amount - b.amount;
      else if (sortField === "category") cmp = a.category.localeCompare(b.category);
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return result;
  }, [transactions, search, type, category, dateFrom, dateTo, sortField, sortDirection]);

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const hasActiveFilters = search !== "" || type !== "all" || category !== "all" || !!dateFrom || !!dateTo;

  return {
    transactions: paginated,
    allFiltered: filtered,
    totalCount,
    currentPage: safePage,
    totalPages,
    setCurrentPage,
    hasActiveFilters,
  };
}
