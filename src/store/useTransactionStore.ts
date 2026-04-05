"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Transaction } from "@/types";
import { MOCK_TRANSACTIONS } from "@/lib/mockData";

interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => void;
  updateTransaction: (id: string, patch: Partial<Omit<Transaction, "id" | "createdAt">>) => void;
  deleteTransaction: (id: string) => void;
  resetToMockData: () => void;
}

let idCounter = 1;
function generateId(): string {
  return `tx_${Date.now()}_${idCounter++}`;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      transactions: MOCK_TRANSACTIONS,
      addTransaction: (t) =>
        set((state) => ({
          transactions: [
            {
              ...t,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...state.transactions,
          ],
        })),
      updateTransaction: (id, patch) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t
          ),
        })),
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
      resetToMockData: () => set({ transactions: MOCK_TRANSACTIONS }),
    }),
    {
      name: "zorvyn_transactions",
      onRehydrateStorage: () => (state) => {
        // Seed with mock data if storage is empty
        if (state && state.transactions.length === 0) {
          state.transactions = MOCK_TRANSACTIONS;
        }
      },
    }
  )
);
