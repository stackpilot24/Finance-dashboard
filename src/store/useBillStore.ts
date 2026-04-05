"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Bill } from "@/types";

const MOCK_BILLS: Bill[] = [
  { id: "bill_1", name: "House Rent", amount: 12000, dueDate: "2026-04-01", category: "housing", isPaid: false, isRecurring: true, frequency: "monthly", createdAt: new Date().toISOString() },
  { id: "bill_2", name: "Electricity Bill", amount: 1800, dueDate: "2026-04-05", category: "utilities", isPaid: false, isRecurring: true, frequency: "monthly", createdAt: new Date().toISOString() },
  { id: "bill_3", name: "Internet", amount: 999, dueDate: "2026-04-10", category: "utilities", isPaid: false, isRecurring: true, frequency: "monthly", createdAt: new Date().toISOString() },
  { id: "bill_4", name: "Health Insurance", amount: 3500, dueDate: "2026-04-15", category: "health", isPaid: false, isRecurring: true, frequency: "monthly", createdAt: new Date().toISOString() },
  { id: "bill_5", name: "Netflix Subscription", amount: 649, dueDate: "2026-04-20", category: "entertainment", isPaid: false, isRecurring: true, frequency: "monthly", createdAt: new Date().toISOString() },
  { id: "bill_6", name: "Gym Membership", amount: 1200, dueDate: "2026-04-25", category: "health", isPaid: false, isRecurring: true, frequency: "monthly", createdAt: new Date().toISOString() },
  { id: "bill_7", name: "Car Insurance", amount: 8500, dueDate: "2026-06-01", category: "transport", isPaid: false, isRecurring: true, frequency: "yearly", createdAt: new Date().toISOString() },
  { id: "bill_8", name: "Water Bill", amount: 450, dueDate: "2026-03-28", category: "utilities", isPaid: false, isRecurring: true, frequency: "monthly", createdAt: new Date().toISOString() },
];

let idCounter = 1;
function generateId() { return `bill_${Date.now()}_${idCounter++}`; }

interface BillStore {
  bills: Bill[];
  addBill: (b: Omit<Bill, "id" | "createdAt">) => void;
  updateBill: (id: string, patch: Partial<Omit<Bill, "id" | "createdAt">>) => void;
  deleteBill: (id: string) => void;
  markPaid: (id: string) => void;
}

export const useBillStore = create<BillStore>()(
  persist(
    (set) => ({
      bills: MOCK_BILLS,
      addBill: (b) => set((s) => ({ bills: [{ ...b, id: generateId(), createdAt: new Date().toISOString() }, ...s.bills] })),
      updateBill: (id, patch) => set((s) => ({ bills: s.bills.map((b) => b.id === id ? { ...b, ...patch } : b) })),
      deleteBill: (id) => set((s) => ({ bills: s.bills.filter((b) => b.id !== id) })),
      markPaid: (id) => set((s) => ({ bills: s.bills.map((b) => b.id === id ? { ...b, isPaid: true } : b) })),
    }),
    {
      name: "zorvyn_bills",
      onRehydrateStorage: () => (state) => {
        if (state && state.bills.length === 0) state.bills = MOCK_BILLS;
      },
    }
  )
);
