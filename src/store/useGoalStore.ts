"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Goal } from "@/types";

const MOCK_GOALS: Goal[] = [
  { id: "goal_1", name: "Emergency Fund", targetAmount: 150000, savedAmount: 62000, deadline: "2026-12-31", category: "other", color: "#6366f1", createdAt: new Date().toISOString() },
  { id: "goal_2", name: "Europe Vacation", targetAmount: 80000, savedAmount: 22000, deadline: "2026-09-01", category: "entertainment", color: "#f59e0b", createdAt: new Date().toISOString() },
  { id: "goal_3", name: "New Laptop", targetAmount: 90000, savedAmount: 45000, deadline: "2026-06-30", category: "shopping", color: "#10b981", createdAt: new Date().toISOString() },
  { id: "goal_4", name: "Home Down Payment", targetAmount: 500000, savedAmount: 120000, deadline: "2027-06-01", category: "housing", color: "#ef4444", createdAt: new Date().toISOString() },
];

let idCounter = 1;
function generateId() { return `goal_${Date.now()}_${idCounter++}`; }

interface GoalStore {
  goals: Goal[];
  addGoal: (g: Omit<Goal, "id" | "createdAt">) => void;
  updateGoal: (id: string, patch: Partial<Omit<Goal, "id" | "createdAt">>) => void;
  deleteGoal: (id: string) => void;
  addSavings: (id: string, amount: number) => void;
}

export const useGoalStore = create<GoalStore>()(
  persist(
    (set) => ({
      goals: MOCK_GOALS,
      addGoal: (g) => set((s) => ({ goals: [{ ...g, id: generateId(), createdAt: new Date().toISOString() }, ...s.goals] })),
      updateGoal: (id, patch) => set((s) => ({ goals: s.goals.map((g) => g.id === id ? { ...g, ...patch } : g) })),
      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      addSavings: (id, amount) => set((s) => ({
        goals: s.goals.map((g) => g.id === id ? { ...g, savedAmount: Math.min(g.savedAmount + amount, g.targetAmount) } : g)
      })),
    }),
    {
      name: "zorvyn_goals",
      onRehydrateStorage: () => (state) => {
        if (state && state.goals.length === 0) state.goals = MOCK_GOALS;
      },
    }
  )
);
