"use client";
import { useState } from "react";
import { useFilteredTransactions } from "@/hooks/useFilteredTransactions";
import { useFilterStore } from "@/store/useFilterStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useRoleStore } from "@/store/useRoleStore";
import { Transaction } from "@/types";
import { formatCurrency, formatDate, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/formatters";
import { useCurrencyStore, CURRENCIES } from "@/store/useCurrencyStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { TransactionModal } from "./TransactionModal";
import { TransactionFilters } from "./TransactionFilters";
import { ArrowUpDown, ArrowUp, ArrowDown, Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useFilterStore as useFS } from "@/store/useFilterStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

function SortButton({ field, label }: { field: "date" | "amount" | "category"; label: string }) {
  const { sortField, sortDirection, toggleSort } = useFS();
  const isActive = sortField === field;
  return (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors text-xs font-medium"
    >
      {label}
      {isActive ? (
        sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </button>
  );
}

function DeleteConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-xl border p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 className="font-semibold text-lg mb-2">Delete Transaction</h3>
        <p className="text-muted-foreground text-sm mb-4">Are you sure you want to delete this transaction? This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Delete</Button>
        </div>
      </div>
    </div>
  );
}

export function TransactionList() {
  const { transactions, totalCount, currentPage, totalPages, setCurrentPage, hasActiveFilters } = useFilteredTransactions();
  const { resetFilters } = useFilterStore();
  const { deleteTransaction } = useTransactionStore();
  const { role } = useRoleStore();
  const isAdmin = role === "admin";
  const { selectedCurrency, convertFromINR } = useCurrencyStore();
  const currencyInfo = CURRENCIES[selectedCurrency];
  const fmt = (amount: number) => formatCurrency(convertFromINR(amount), false, selectedCurrency, currencyInfo.locale);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openAdd = () => { setEditingTx(undefined); setModalOpen(true); };
  const openEdit = (tx: Transaction) => { setEditingTx(tx); setModalOpen(true); };
  const handleDelete = () => {
    if (deletingId) { deleteTransaction(deletingId); setDeletingId(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
          <p className="text-sm text-muted-foreground">{totalCount} transaction{totalCount !== 1 ? "s" : ""}</p>
        </div>
        {isAdmin && (
          <Button onClick={openAdd} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        )}
      </div>

      <TransactionFilters />

      {/* Desktop table */}
      <div className="hidden md:block rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 text-muted-foreground"><SortButton field="date" label="Date" /></th>
              <th className="text-left px-4 py-3 text-muted-foreground">Description</th>
              <th className="text-left px-4 py-3 text-muted-foreground"><SortButton field="category" label="Category" /></th>
              <th className="text-left px-4 py-3 text-muted-foreground">Type</th>
              <th className="text-right px-4 py-3 text-muted-foreground"><SortButton field="amount" label="Amount" /></th>
              {isAdmin && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5}>
                    <EmptyState
                      title="No transactions found"
                      description={hasActiveFilters ? "Try adjusting your filters." : "Add a transaction to get started."}
                      action={hasActiveFilters ? { label: "Clear filters", onClick: resetFilters } : undefined}
                    />
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <motion.tr
                    key={tx.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(tx.date)}</td>
                    <td className="px-4 py-3 font-medium max-w-xs truncate">{tx.description}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[tx.category] }} />
                        {CATEGORY_LABELS[tx.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={tx.type === "income" ? "default" : "destructive"} className={cn("text-xs capitalize", tx.type === "income" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 hover:bg-emerald-100" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 hover:bg-red-100")}>
                        {tx.type}
                      </Badge>
                    </td>
                    <td className={cn("px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap", tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                      {tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(tx)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeletingId(tx.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {transactions.length === 0 ? (
          <EmptyState
            title="No transactions found"
            description={hasActiveFilters ? "Try adjusting your filters." : "Add a transaction to get started."}
            action={hasActiveFilters ? { label: "Clear filters", onClick: resetFilters } : undefined}
          />
        ) : (
          transactions.map((tx) => (
            <motion.div key={tx.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="rounded-xl border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{tx.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{formatDate(tx.date)}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[tx.category] }} />
                      {CATEGORY_LABELS[tx.category]}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("font-bold tabular-nums", tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                    {tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}
                  </p>
                  {isAdmin && (
                    <div className="flex gap-1 mt-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(tx)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => setDeletingId(tx.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({totalCount} total)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      {modalOpen && <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} transaction={editingTx} />}
      {deletingId && <DeleteConfirmDialog onConfirm={handleDelete} onCancel={() => setDeletingId(null)} />}
    </div>
  );
}
