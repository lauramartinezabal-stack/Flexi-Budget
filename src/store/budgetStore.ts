import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ExpenseCategory,
  ExpenseEntry,
  FixedExpense,
  IncomeEntry,
  IncomeSource,
  VariableExpense,
} from "../types";

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

interface BudgetState {
  incomes: IncomeEntry[];
  expenses: ExpenseEntry[];
  addIncome: (input: {
    amount: number;
    source?: IncomeSource;
    note?: string;
    date: string;
  }) => void;
  addVariableExpense: (input: {
    amount: number;
    category: ExpenseCategory;
    note?: string;
    date: string;
  }) => void;
  addFixedExpense: (input: {
    amount: number;
    name: string;
    dueDate: string;
  }) => void;
  toggleFixedPaid: (id: string) => void;
  deleteIncome: (id: string) => void;
  deleteExpense: (id: string) => void;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      incomes: [],
      expenses: [],

      addIncome: (input) =>
        set((state) => ({
          incomes: [
            ...state.incomes,
            {
              id: makeId(),
              kind: "income",
              amount: input.amount,
              source: input.source,
              note: input.note,
              date: input.date,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      addVariableExpense: (input) =>
        set((state) => ({
          expenses: [
            ...state.expenses,
            {
              id: makeId(),
              kind: "variable",
              amount: input.amount,
              category: input.category,
              note: input.note,
              date: input.date,
              createdAt: new Date().toISOString(),
            } satisfies VariableExpense,
          ],
        })),

      addFixedExpense: (input) =>
        set((state) => ({
          expenses: [
            ...state.expenses,
            {
              id: makeId(),
              kind: "fixed",
              amount: input.amount,
              name: input.name,
              dueDate: input.dueDate,
              paid: false,
              createdAt: new Date().toISOString(),
            } satisfies FixedExpense,
          ],
        })),

      toggleFixedPaid: (id) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.kind === "fixed" && e.id === id ? { ...e, paid: !e.paid } : e,
          ),
        })),

      deleteIncome: (id) =>
        set((state) => ({
          incomes: state.incomes.filter((i) => i.id !== id),
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),
    }),
    { name: "flexi-budget-storage" },
  ),
);
