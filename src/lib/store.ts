"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type { Category, ExpenseEntry, IncomeEntry } from "./types";

interface BudgetState {
  incomes: IncomeEntry[];
  expenses: ExpenseEntry[];
  lastWeeklyNotificationWeekKey: string | null;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  addIncome: (input: { amount: number; source?: string; date: string }) => void;
  removeIncome: (id: string) => void;

  addVariableExpense: (input: {
    amount: number;
    category: Category;
    name?: string;
    date: string;
  }) => void;
  addFixedExpense: (input: { amount: number; name: string; dueDate: string }) => void;
  removeExpense: (id: string) => void;

  markWeeklyNotificationSeen: (weekKey: string) => void;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      incomes: [],
      expenses: [],
      lastWeeklyNotificationWeekKey: null,
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      addIncome: ({ amount, source, date }) =>
        set((state) => ({
          incomes: [
            ...state.incomes,
            {
              id: uuid(),
              amount,
              source: source?.trim() || undefined,
              date,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      removeIncome: (id) =>
        set((state) => ({ incomes: state.incomes.filter((i) => i.id !== id) })),

      addVariableExpense: ({ amount, category, name, date }) =>
        set((state) => ({
          expenses: [
            ...state.expenses,
            {
              id: uuid(),
              kind: "variable",
              amount,
              category,
              name: name?.trim() || undefined,
              date,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      addFixedExpense: ({ amount, name, dueDate }) =>
        set((state) => ({
          expenses: [
            ...state.expenses,
            {
              id: uuid(),
              kind: "fixed",
              amount,
              name: name.trim(),
              dueDate,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      removeExpense: (id) =>
        set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) })),

      markWeeklyNotificationSeen: (weekKey) =>
        set({ lastWeeklyNotificationWeekKey: weekKey }),
    }),
    {
      name: "flexi-budget-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
