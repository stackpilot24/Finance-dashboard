"use client";
import { useState, useEffect } from "react";
import { Goal, Category } from "@/types";
import { useGoalStore } from "@/store/useGoalStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_LABELS } from "@/lib/formatters";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#3b82f6", "#ec4899", "#14b8a6"];
const CATEGORIES = Object.entries(CATEGORY_LABELS) as [Category, string][];

interface Props { open: boolean; onClose: () => void; goal?: Goal; mode?: "edit" | "savings"; }

export function GoalModal({ open, onClose, goal, mode = "edit" }: Props) {
  const { addGoal, updateGoal, addSavings } = useGoalStore();

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState<Category>("other");
  const [color, setColor] = useState(COLORS[0]);
  const [savingsAmount, setSavingsAmount] = useState("");

  useEffect(() => {
    if (goal) {
      setName(goal.name); setTargetAmount(String(goal.targetAmount));
      setDeadline(goal.deadline); setCategory(goal.category);
      setColor(goal.color); setSavingsAmount("");
    } else {
      setName(""); setTargetAmount(""); setDeadline("");
      setCategory("other"); setColor(COLORS[0]); setSavingsAmount("");
    }
  }, [goal, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "savings" && goal) {
      addSavings(goal.id, parseFloat(savingsAmount));
    } else if (goal) {
      updateGoal(goal.id, { name, targetAmount: parseFloat(targetAmount), deadline, category, color });
    } else {
      addGoal({ name, targetAmount: parseFloat(targetAmount), savedAmount: 0, deadline, category, color });
    }
    onClose();
  }

  if (mode === "savings") {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add Savings to {goal?.name}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Amount to Add (₹)</Label>
              <Input type="number" min="1" step="0.01" value={savingsAmount} onChange={(e) => setSavingsAmount(e.target.value)} required autoFocus />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Add Savings</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{goal ? "Edit Goal" : "New Goal"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Goal Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Emergency Fund" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Target Amount (₹)</Label>
              <Input type="number" min="1" step="0.01" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Deadline</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-transform ${color === c ? "scale-125 ring-2 ring-offset-2 ring-foreground" : ""}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{goal ? "Save Changes" : "Create Goal"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
