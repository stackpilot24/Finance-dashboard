"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, CheckCircle, RotateCcw, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useBillStore } from "@/store/useBillStore";
import { useRoleStore } from "@/store/useRoleStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { CURRENCIES } from "@/store/useCurrencyStore";
import { BillModal } from "./BillModal";
import { Bill, BillStatus } from "@/types";
import { getBillStatus, getDaysUntilDue } from "@/lib/billUtils";
import { formatCurrency, CATEGORY_LABELS } from "@/lib/formatters";

const STATUS_CONFIG: Record<BillStatus, { label: string; color: string; icon: React.ReactNode }> = {
  overdue: { label: "Overdue", color: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400", icon: <AlertCircle className="h-3.5 w-3.5" /> },
  due_today: { label: "Due Today", color: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400", icon: <Clock className="h-3.5 w-3.5" /> },
  upcoming: { label: "Upcoming", color: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400", icon: <Clock className="h-3.5 w-3.5" /> },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", icon: <CheckCircle className="h-3.5 w-3.5" /> },
};

function getBillStatusFull(bill: Bill): BillStatus {
  if (bill.isPaid) return "paid";
  return getBillStatus(bill.dueDate);
}

export function BillList() {
  const { bills, deleteBill, markPaid, updateBill } = useBillStore();
  const role = useRoleStore((s) => s.role);
  const isAdmin = role === "admin";
  const { selectedCurrency, convertFromINR } = useCurrencyStore();
  const currencyInfo = CURRENCIES[selectedCurrency];

  const [modalOpen, setModalOpen] = useState(false);
  const [editBill, setEditBill] = useState<Bill | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const sorted = [...bills].sort((a, b) => {
    if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  function handleEdit(bill: Bill) { setEditBill(bill); setModalOpen(true); }
  function handleAdd() { setEditBill(undefined); setModalOpen(true); }
  function handleUnpaid(id: string) { updateBill(id, { isPaid: false }); }

  const totalUnpaid = bills.filter((b) => !b.isPaid).reduce((s, b) => s + b.amount, 0);
  const overdueCount = bills.filter((b) => !b.isPaid && getBillStatus(b.dueDate) === "overdue").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bill Reminders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatCurrency(convertFromINR(totalUnpaid), false, selectedCurrency, currencyInfo.locale)} unpaid
            {overdueCount > 0 && <span className="text-red-500 ml-2">· {overdueCount} overdue</span>}
          </p>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={handleAdd} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Bill
          </Button>
        )}
      </div>

      {/* List */}
      <div className="space-y-2">
        {sorted.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">No bills added yet.</div>
        )}
        {sorted.map((bill, i) => {
          const status = getBillStatusFull(bill);
          const cfg = STATUS_CONFIG[status];
          const daysLeft = getDaysUntilDue(bill.dueDate);
          return (
            <motion.div key={bill.id} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
              <Card className={`p-4 ${status === "overdue" ? "border-red-200 dark:border-red-900" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-sm ${bill.isPaid ? "line-through text-muted-foreground" : ""}`}>{bill.name}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
                        {cfg.icon}{cfg.label}
                      </span>
                      {bill.isRecurring && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 px-2 py-0.5 text-xs">
                          <RotateCcw className="h-3 w-3" />{bill.frequency}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                      <span>{CATEGORY_LABELS[bill.category]}</span>
                      <span>Due: {bill.dueDate}</span>
                      {!bill.isPaid && status !== "overdue" && daysLeft > 0 && <span>({daysLeft}d left)</span>}
                      {bill.notes && <span className="italic">{bill.notes}</span>}
                    </div>
                  </div>
                  <span className="font-semibold text-sm shrink-0">
                    {formatCurrency(convertFromINR(bill.amount), false, selectedCurrency, currencyInfo.locale)}
                  </span>
                </div>
                {isAdmin && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t">
                    {!bill.isPaid ? (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/20" onClick={() => markPaid(bill.id)}>
                        <CheckCircle className="h-3.5 w-3.5" /> Mark Paid
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground" onClick={() => handleUnpaid(bill.id)}>
                        <RotateCcw className="h-3 w-3" /> Mark Unpaid
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => handleEdit(bill)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    {deleteConfirm === bill.id ? (
                      <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => { deleteBill(bill.id); setDeleteConfirm(null); }}>
                        Confirm Delete
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground hover:text-red-500" onClick={() => setDeleteConfirm(bill.id)}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
      <BillModal open={modalOpen} onClose={() => setModalOpen(false)} bill={editBill} />
    </div>
  );
}
