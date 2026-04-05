"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RecurringTransaction } from "@/types";

const MOCK_RECURRING: RecurringTransaction[] = [
  { id: "rec_1", description: "Monthly Salary", amount: 85000, type: "income", category: "salary", frequency: "monthly", startDate: "2024-01-01", nextDueDate: "2026-04-30", isActive: true, createdAt: new Date().toISOString() },
  { id: "rec_2", description: "House Rent", amount: 12000, type: "expense", category: "housing", frequency: "monthly", startDate: "2024-01-01", nextDueDate: "2026-04-01", isActive: true, createdAt: new Date().toISOString() },
  { id: "rec_3", description: "Netflix", amount: 649, type: "expense", category: "entertainment", frequency: "monthly", startDate: "2024-03-01", nextDueDate: "2026-04-20", isActive: true, createdAt: new Date().toISOString() },
  { id: "rec_4", description: "Gym Membership", amount: 1200, type: "expense", category: "health", frequency: "monthly", startDate: "2024-01-01", nextDueDate: "2026-04-25", isActive: true, createdAt: new Date().toISOString() },
  { id: "rec_5", description: "Phone Bill", amount: 599, type: "expense", category: "utilities", frequency: "monthly", startDate: "2024-01-01", nextDueDate: "2026-04-15", isActive: false, createdAt: new Date().toISOString() },
];

let idCounter = 1;
function generateId() { return `rec_${Date.now()}_${idCounter++}`; }

interface RecurringStore {
  items: RecurringTransaction[];
  addItem: (item: Omit<RecurringTransaction, "id" | "createdAt">) => void;
  updateItem: (id: string, patch: Partial<Omit<RecurringTransaction, "id" | "createdAt">>) => void;
  deleteItem: (id: string) => void;
  toggleActive: (id: string) => void;
  updateNextDueDate: (id: string, nextDueDate: string) => void;
}

export const useRecurringStore = create<RecurringStore>()(
  persist(
    (set) => ({
      items: MOCK_RECURRING,
      addItem: (item) => set((s) => ({ items: [{ ...item, id: generateId(), createdAt: new Date().toISOString() }, ...s.items] })),
      updateItem: (id, patch) => set((s) => ({ items: s.items.map((r) => r.id === id ? { ...r, ...patch } : r) })),
      deleteItem: (id) => set((s) => ({ items: s.items.filter((r) => r.id !== id) })),
      toggleActive: (id) => set((s) => ({ items: s.items.map((r) => r.id === id ? { ...r, isActive: !r.isActive } : r) })),
      updateNextDueDate: (id, nextDueDate) => set((s) => ({ items: s.items.map((r) => r.id === id ? { ...r, nextDueDate } : r) })),
    }),
    {
      name: "zorvyn_recurring",
      onRehydrateStorage: () => (state) => {
        if (state && state.items.length === 0) state.items = MOCK_RECURRING;
      },
    }
  )
);
