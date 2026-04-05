"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Play, RotateCcw, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRecurringStore } from "@/store/useRecurringStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useRoleStore } from "@/store/useRoleStore";
import { useCurrencyStore, CURRENCIES } from "@/store/useCurrencyStore";
import { RecurringModal } from "./RecurringModal";
import { RecurringTransaction } from "@/types";
import { formatCurrency, CATEGORY_LABELS } from "@/lib/formatters";
import { getNextDueDate } from "@/lib/billUtils";

export function RecurringList() {
  const { items, deleteItem, toggleActive, updateNextDueDate } = useRecurringStore();
  const { addTransaction } = useTransactionStore();
  const role = useRoleStore((s) => s.role);
  const isAdmin = role === "admin";
  const { selectedCurrency, convertFromINR } = useCurrencyStore();
  const currencyInfo = CURRENCIES[selectedCurrency];

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<RecurringTransaction | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string | null>(null);

  function handleGenerateNow(item: RecurringTransaction) {
    const today = new Date().toISOString().split("T")[0];
    addTransaction({ date: today, amount: item.amount, type: item.type, category: item.category, description: item.description });
    updateNextDueDate(item.id, getNextDueDate(today, item.frequency));
    setGenerated(item.id);
    setTimeout(() => setGenerated(null), 2000);
  }

  const activeItems = items.filter((i) => i.isActive);
  const inactiveItems = items.filter((i) => !i.isActive);

  const monthlyEstimate = activeItems.reduce((sum, item) => {
    const multipliers: Record<string, number> = { daily: 30, weekly: 4.33, monthly: 1, yearly: 1 / 12 };
    const mult = multipliers[item.frequency] ?? 1;
    return item.type === "expense" ? sum - item.amount * mult : sum + item.amount * mult;
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recurring Transactions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monthly net estimate:&nbsp;
            <span className={monthlyEstimate >= 0 ? "text-emerald-600" : "text-red-500"}>
              {formatCurrency(Math.abs(convertFromINR(monthlyEstimate)), true, selectedCurrency, currencyInfo.locale)}
            </span>
          </p>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => { setEditItem(undefined); setModalOpen(true); }} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Recurring
          </Button>
        )}
      </div>

      {[{ label: "Active", list: activeItems }, { label: "Inactive", list: inactiveItems }].map(({ label, list }) =>
        list.length > 0 ? (
          <div key={label} className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
            {list.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                <Card className={`p-4 ${!item.isActive ? "opacity-60" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${item.type === "income" ? "bg-emerald-100 dark:bg-emerald-950/40" : "bg-red-100 dark:bg-red-950/40"}`}>
                      {item.type === "income"
                        ? <TrendingUp className="h-4 w-4 text-emerald-600" />
                        : <TrendingDown className="h-4 w-4 text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{item.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {CATEGORY_LABELS[item.category]} · {item.frequency} · Next: {item.nextDueDate}
                      </p>
                    </div>
                    <span className={`font-semibold text-sm shrink-0 ${item.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                      {item.type === "income" ? "+" : "-"}{formatCurrency(convertFromINR(item.amount), false, selectedCurrency, currencyInfo.locale)}
                    </span>
                  </div>
                  {isAdmin && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t">
                      {item.isActive && (
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                          onClick={() => handleGenerateNow(item)}
                          disabled={generated === item.id}>
                          {generated === item.id ? <><RotateCcw className="h-3 w-3 animate-spin" /> Done</> : <><Play className="h-3 w-3" /> Generate Now</>}
                        </Button>
                      )}
                      <Button size="sm" variant={item.isActive ? "outline" : "ghost"} className="h-7 text-xs gap-1" onClick={() => toggleActive(item.id)}>
                        <RotateCcw className="h-3 w-3" />{item.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => { setEditItem(item); setModalOpen(true); }}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                      {deleteConfirm === item.id ? (
                        <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => { deleteItem(item.id); setDeleteConfirm(null); }}>Confirm Delete</Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground hover:text-red-500" onClick={() => setDeleteConfirm(item.id)}>
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        ) : null
      )}

      {items.length === 0 && (
        <div className="text-center py-16 text-muted-foreground text-sm">No recurring transactions set up yet.</div>
      )}

      <RecurringModal open={modalOpen} onClose={() => setModalOpen(false)} item={editItem} />
    </div>
  );
}
