"use client";
import { useFilterStore } from "@/store/useFilterStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/formatters";
import { Category } from "@/types";
import { useState } from "react";
import { cn } from "@/lib/utils";

const CATEGORIES: Category[] = [
  "salary", "freelance", "investment", "food", "transport", "housing",
  "utilities", "entertainment", "health", "shopping", "education", "other",
];

export function TransactionFilters() {
  const {
    search, type, category, dateFrom, dateTo,
    setSearch, setType, setCategory, setDateRange, resetFilters,
  } = useFilterStore();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActive = search || type !== "all" || category !== "all" || dateFrom || dateTo;
  const activeCount = [search, type !== "all", category !== "all", dateFrom, dateTo].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Type filter */}
        <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced toggle */}
        <Button
          variant="outline"
          size="default"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn("gap-1.5", showAdvanced && "bg-accent")}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>

        {hasActive && (
          <Button variant="ghost" size="default" onClick={resetFilters} className="gap-1.5 text-muted-foreground">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {showAdvanced && (
        <div className="flex gap-2 flex-wrap p-3 rounded-lg bg-muted/50 border">
          {/* Category */}
          <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom || ""}
              onChange={(e) => setDateRange(e.target.value || null, dateTo)}
              className="w-40 text-sm"
              placeholder="From"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <Input
              type="date"
              value={dateTo || ""}
              onChange={(e) => setDateRange(dateFrom, e.target.value || null)}
              className="w-40 text-sm"
              placeholder="To"
            />
          </div>
        </div>
      )}
    </div>
  );
}
