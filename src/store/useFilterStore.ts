"use client";
import { create } from "zustand";
import { FilterState, SortField, SortDirection, TransactionType, Category } from "@/types";

interface FilterStore extends FilterState {
  setSearch: (v: string) => void;
  setType: (v: FilterState["type"]) => void;
  setCategory: (v: FilterState["category"]) => void;
  setDateRange: (from: string | null, to: string | null) => void;
  setSortField: (f: SortField) => void;
  setSortDirection: (d: SortDirection) => void;
  toggleSort: (f: SortField) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  type: "all",
  category: "all",
  dateFrom: null,
  dateTo: null,
  sortField: "date",
  sortDirection: "desc",
};

export const useFilterStore = create<FilterStore>()((set, get) => ({
  ...DEFAULT_FILTERS,
  setSearch: (search) => set({ search }),
  setType: (type) => set({ type }),
  setCategory: (category) => set({ category }),
  setDateRange: (dateFrom, dateTo) => set({ dateFrom, dateTo }),
  setSortField: (sortField) => set({ sortField }),
  setSortDirection: (sortDirection) => set({ sortDirection }),
  toggleSort: (field) => {
    const { sortField, sortDirection } = get();
    if (sortField === field) {
      set({ sortDirection: sortDirection === "asc" ? "desc" : "asc" });
    } else {
      set({ sortField: field, sortDirection: "desc" });
    }
  },
  resetFilters: () => set(DEFAULT_FILTERS),
}));
