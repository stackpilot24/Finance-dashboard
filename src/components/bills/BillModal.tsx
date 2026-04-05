"use client";
import { useState, useEffect } from "react";
import { Bill, Category, BillFrequency } from "@/types";
import { useBillStore } from "@/store/useBillStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_LABELS } from "@/lib/formatters";

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [Category, string][];

interface Props {
  open: boolean;
  onClose: () => void;
  bill?: Bill;
}

export function BillModal({ open, onClose, bill }: Props) {
  const { addBill, updateBill } = useBillStore();
  const isEdit = !!bill;

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState<Category>("utilities");
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<BillFrequency>("monthly");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (bill) {
      setName(bill.name); setAmount(String(bill.amount)); setDueDate(bill.dueDate);
      setCategory(bill.category); setIsRecurring(bill.isRecurring);
      setFrequency(bill.frequency ?? "monthly"); setNotes(bill.notes ?? "");
    } else {
      setName(""); setAmount(""); setDueDate(""); setCategory("utilities");
      setIsRecurring(false); setFrequency("monthly"); setNotes("");
    }
  }, [bill, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { name, amount: parseFloat(amount), dueDate, category, isPaid: bill?.isPaid ?? false, isRecurring, frequency: isRecurring ? frequency : undefined, notes: notes || undefined };
    if (isEdit) updateBill(bill!.id, data);
    else addBill(data);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Bill" : "Add Bill"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Bill Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Electricity Bill" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Amount (₹)</Label>
              <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Due Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="recurring" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="h-4 w-4 accent-primary" />
            <Label htmlFor="recurring" className="cursor-pointer">Recurring bill</Label>
          </div>
          {isRecurring && (
            <div className="space-y-1">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as BillFrequency)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1">
            <Label>Notes (optional)</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes..." />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{isEdit ? "Save Changes" : "Add Bill"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
