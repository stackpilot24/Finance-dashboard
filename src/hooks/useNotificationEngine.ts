"use client";
import { useEffect, useRef } from "react";
import { useBillStore } from "@/store/useBillStore";
import { useGoalStore } from "@/store/useGoalStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { getBillStatus } from "@/lib/billUtils";

// Runs once per session to generate notifications from bills, goals, and transactions
export function useNotificationEngine() {
  const initialized = useRef(false);
  const bills = useBillStore((s) => s.bills);
  const goals = useGoalStore((s) => s.goals);
  const transactions = useTransactionStore((s) => s.transactions);
  const { notifications, addNotification } = useNotificationStore();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const existingRelatedIds = new Set(notifications.map((n) => n.relatedId).filter(Boolean));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Bill notifications
    for (const bill of bills) {
      if (bill.isPaid) continue;
      const status = getBillStatus(bill.dueDate);
      const key = `bill_${bill.id}_${status}`;
      if (existingRelatedIds.has(key)) continue;

      if (status === "overdue") {
        addNotification({ title: "Bill Overdue", message: `${bill.name} was due on ${bill.dueDate} and is still unpaid.`, type: "error", relatedId: key });
      } else if (status === "due_today") {
        addNotification({ title: "Bill Due Today", message: `${bill.name} of ₹${bill.amount.toLocaleString()} is due today.`, type: "warning", relatedId: key });
      } else {
        // upcoming within 3 days
        const dueDate = new Date(bill.dueDate + "T00:00:00");
        const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 3) {
          addNotification({ title: "Bill Due Soon", message: `${bill.name} is due in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`, type: "warning", relatedId: key });
        }
      }
    }

    // Goal notifications
    for (const goal of goals) {
      const progress = goal.savedAmount / goal.targetAmount;
      const deadlineDate = new Date(goal.deadline + "T00:00:00");
      const daysToDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (progress >= 1) {
        const key = `goal_complete_${goal.id}`;
        if (!existingRelatedIds.has(key)) {
          addNotification({ title: "Goal Achieved!", message: `Congratulations! You've reached your goal: ${goal.name}`, type: "success", relatedId: key });
        }
      } else if (daysToDeadline > 0 && daysToDeadline <= 7) {
        const key = `goal_deadline_${goal.id}`;
        if (!existingRelatedIds.has(key)) {
          addNotification({ title: "Goal Deadline Approaching", message: `${goal.name} deadline is in ${daysToDeadline} day${daysToDeadline === 1 ? "" : "s"}. ${Math.round(progress * 100)}% saved.`, type: "warning", relatedId: key });
        }
      }
    }

    // Large transaction notifications (most recent 5 transactions > 5000)
    const largeTxns = transactions.filter((t) => t.type === "expense" && t.amount >= 5000).slice(0, 5);
    for (const t of largeTxns) {
      const key = `large_tx_${t.id}`;
      if (!existingRelatedIds.has(key)) {
        addNotification({ title: "Large Expense Detected", message: `₹${t.amount.toLocaleString()} spent on ${t.description} (${t.date}).`, type: "info", relatedId: key });
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
