"use client";
import { useState } from "react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useCurrencyStore, CURRENCIES } from "@/store/useCurrencyStore";
import { Transaction, Category, TransactionType } from "@/types";
import { CATEGORY_LABELS } from "@/lib/formatters";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES: Category[] = [
  "salary", "freelance", "investment", "food", "transport", "housing",
  "utilities", "entertainment", "health", "shopping", "education", "other",
];

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction;
}

export function TransactionModal({ open, onClose, transaction }: TransactionModalProps) {
  const { addTransaction, updateTransaction } = useTransactionStore();
  const { selectedCurrency } = useCurrencyStore();
  const currencySymbol = CURRENCIES[selectedCurrency].symbol;
  const isEdit = !!transaction;

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    date: transaction?.date || today,
    amount: transaction?.amount.toString() || "",
    type: (transaction?.type || "expense") as TransactionType,
    category: (transaction?.category || "food") as Category,
    description: transaction?.description || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.date) e.date = "Date is required";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      e.amount = "Amount must be a positive number";
    }
    if (!form.description.trim()) e.description = "Description is required";
    if (form.description.length > 100) e.description = "Max 100 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const data = {
      date: form.date,
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category,
      description: form.description.trim(),
    };
    if (isEdit && transaction) {
      updateTransaction(transaction.id, data);
    } else {
      addTransaction(data);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Date */}
          <div className="space-y-1">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={form.date} max={today} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
          </div>

          {/* Type */}
          <div className="space-y-1">
            <Label>Type</Label>
            <div className="flex gap-2">
              {(["income", "expense"] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, type: t })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${
                    form.type === t
                      ? t === "income"
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-red-500 text-white border-red-500"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <Label htmlFor="amount">Amount ({currencySymbol})</Label>
            <Input id="amount" type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Category })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="desc">Description</Label>
            <Input id="desc" placeholder="What was this for?" value={form.description} maxLength={100} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex justify-between">
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
              <p className="text-xs text-muted-foreground ml-auto">{form.description.length}/100</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{isEdit ? "Save Changes" : "Add Transaction"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
