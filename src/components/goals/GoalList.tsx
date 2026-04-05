"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, PiggyBank, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGoalStore } from "@/store/useGoalStore";
import { useRoleStore } from "@/store/useRoleStore";
import { useCurrencyStore, CURRENCIES } from "@/store/useCurrencyStore";
import { GoalModal } from "./GoalModal";
import { Goal } from "@/types";
import { formatCurrency } from "@/lib/formatters";

function getDaysLeft(deadline: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(deadline + "T00:00:00");
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function GoalList() {
  const { goals, deleteGoal } = useGoalStore();
  const role = useRoleStore((s) => s.role);
  const isAdmin = role === "admin";
  const { selectedCurrency, convertFromINR } = useCurrencyStore();
  const currencyInfo = CURRENCIES[selectedCurrency];

  const [modalOpen, setModalOpen] = useState(false);
  const [savingsOpen, setSavingsOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState<Goal | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Goal Tracker</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatCurrency(convertFromINR(totalSaved), false, selectedCurrency, currencyInfo.locale)} saved of {formatCurrency(convertFromINR(totalTarget), false, selectedCurrency, currencyInfo.locale)} total target
          </p>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => { setActiveGoal(undefined); setModalOpen(true); }} className="gap-1.5">
            <Plus className="h-4 w-4" /> New Goal
          </Button>
        )}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          <Target className="h-10 w-10 mx-auto opacity-20 mb-3" />
          No goals yet. Create your first goal!
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {goals.map((goal, i) => {
          const progress = Math.min(goal.savedAmount / goal.targetAmount, 1);
          const pct = Math.round(progress * 100);
          const daysLeft = getDaysLeft(goal.deadline);
          const isComplete = progress >= 1;
          return (
            <motion.div key={goal.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Card className={`p-5 space-y-4 ${isComplete ? "border-emerald-300 dark:border-emerald-800" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: goal.color + "22" }}>
                      <PiggyBank className="h-5 w-5" style={{ color: goal.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{goal.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {isComplete ? "Completed!" : daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setActiveGoal(goal); setModalOpen(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {deleteConfirm === goal.id ? (
                        <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => { deleteGoal(goal.id); setDeleteConfirm(null); }}>Confirm</Button>
                      ) : (
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-red-500" onClick={() => setDeleteConfirm(goal.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(convertFromINR(goal.savedAmount), false, selectedCurrency, currencyInfo.locale)} saved</span>
                    <span className="font-medium" style={{ color: goal.color }}>{pct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: goal.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Target: {formatCurrency(convertFromINR(goal.targetAmount), false, selectedCurrency, currencyInfo.locale)}</span>
                    <span>{formatCurrency(convertFromINR(goal.targetAmount - goal.savedAmount), false, selectedCurrency, currencyInfo.locale)} remaining</span>
                  </div>
                </div>

                {isAdmin && !isComplete && (
                  <Button size="sm" variant="outline" className="w-full h-7 text-xs gap-1" onClick={() => { setActiveGoal(goal); setSavingsOpen(true); }}>
                    <Plus className="h-3.5 w-3.5" /> Add Savings
                  </Button>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      <GoalModal open={modalOpen} onClose={() => setModalOpen(false)} goal={activeGoal} mode="edit" />
      <GoalModal open={savingsOpen} onClose={() => setSavingsOpen(false)} goal={activeGoal} mode="savings" />
    </div>
  );
}
