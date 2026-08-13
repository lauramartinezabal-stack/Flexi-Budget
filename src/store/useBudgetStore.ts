import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category, FixedExpense, Income, VariableExpense } from "../types";

function makeId(): string {
  return crypto.randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

interface BudgetState {
  incomes: Income[];
  variableExpenses: VariableExpense[];
  fixedExpenses: FixedExpense[];
  lastWeeklyNotificationAt: string | null;

  addIncome: (input: { amount: number; source?: string; date: string }) => void;
  removeIncome: (id: string) => void;

  addVariableExpense: (input: {
    amount: number;
    category: Category;
    description?: string;
    date: string;
  }) => void;
  removeVariableExpense: (id: string) => void;

  addFixedExpense: (input: {
    amount: number;
    name: string;
    category: Category;
    dueDate: string;
  }) => void;
  markFixedExpensePaid: (id: string, paid: boolean) => void;
  removeFixedExpense: (id: string) => void;

  markWeeklyNotificationSeen: () => void;
  resetAll: () => void;
  loadSampleData: () => void;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      incomes: [],
      variableExpenses: [],
      fixedExpenses: [],
      lastWeeklyNotificationAt: null,

      addIncome: ({ amount, source, date }) =>
        set((state) => ({
          incomes: [
            ...state.incomes,
            { id: makeId(), type: "income", amount, source, date, createdAt: nowIso() },
          ],
        })),

      removeIncome: (id) =>
        set((state) => ({ incomes: state.incomes.filter((i) => i.id !== id) })),

      addVariableExpense: ({ amount, category, description, date }) =>
        set((state) => ({
          variableExpenses: [
            ...state.variableExpenses,
            {
              id: makeId(),
              type: "variable",
              amount,
              category,
              description,
              date,
              createdAt: nowIso(),
            },
          ],
        })),

      removeVariableExpense: (id) =>
        set((state) => ({
          variableExpenses: state.variableExpenses.filter((e) => e.id !== id),
        })),

      addFixedExpense: ({ amount, name, category, dueDate }) =>
        set((state) => ({
          fixedExpenses: [
            ...state.fixedExpenses,
            {
              id: makeId(),
              type: "fixed",
              amount,
              name,
              category,
              dueDate,
              createdAt: nowIso(),
              paid: false,
            },
          ],
        })),

      markFixedExpensePaid: (id, paid) =>
        set((state) => ({
          fixedExpenses: state.fixedExpenses.map((e) =>
            e.id === id
              ? { ...e, paid, paidDate: paid ? new Date().toISOString().slice(0, 10) : undefined }
              : e,
          ),
        })),

      removeFixedExpense: (id) =>
        set((state) => ({
          fixedExpenses: state.fixedExpenses.filter((e) => e.id !== id),
        })),

      markWeeklyNotificationSeen: () => set({ lastWeeklyNotificationAt: nowIso() }),

      resetAll: () =>
        set({
          incomes: [],
          variableExpenses: [],
          fixedExpenses: [],
          lastWeeklyNotificationAt: null,
        }),

      loadSampleData: () =>
        set(() => {
          const today = new Date();
          const iso = (daysOffset: number) => {
            const d = new Date(today);
            d.setDate(d.getDate() + daysOffset);
            return d.toISOString().slice(0, 10);
          };
          return {
            incomes: [
              {
                id: makeId(),
                type: "income",
                amount: 450,
                source: "Scholarship",
                date: iso(-18),
                createdAt: nowIso(),
              },
              {
                id: makeId(),
                type: "income",
                amount: 120,
                source: "Part-time job",
                date: iso(-10),
                createdAt: nowIso(),
              },
              {
                id: makeId(),
                type: "income",
                amount: 80,
                source: "Family",
                date: iso(-3),
                createdAt: nowIso(),
              },
            ],
            variableExpenses: [
              {
                id: makeId(),
                type: "variable",
                amount: 24.5,
                category: "food",
                description: "Groceries",
                date: iso(-6),
                createdAt: nowIso(),
              },
              {
                id: makeId(),
                type: "variable",
                amount: 12,
                category: "transport",
                description: "Bus pass top-up",
                date: iso(-5),
                createdAt: nowIso(),
              },
              {
                id: makeId(),
                type: "variable",
                amount: 30,
                category: "leisure",
                description: "Movie night",
                date: iso(-4),
                createdAt: nowIso(),
              },
              {
                id: makeId(),
                type: "variable",
                amount: 18.75,
                category: "food",
                description: "Coffee & lunch",
                date: iso(-2),
                createdAt: nowIso(),
              },
              {
                id: makeId(),
                type: "variable",
                amount: 9,
                category: "other",
                description: "Printing",
                date: iso(-1),
                createdAt: nowIso(),
              },
            ],
            fixedExpenses: [
              {
                id: makeId(),
                type: "fixed",
                amount: 350,
                name: "Tuition installment",
                category: "other",
                dueDate: iso(20),
                createdAt: nowIso(),
                paid: false,
              },
              {
                id: makeId(),
                type: "fixed",
                amount: 60,
                name: "Phone plan",
                category: "other",
                dueDate: iso(5),
                createdAt: nowIso(),
                paid: false,
              },
              {
                id: makeId(),
                type: "fixed",
                amount: 15,
                name: "Streaming subscription",
                category: "leisure",
                dueDate: iso(12),
                createdAt: nowIso(),
                paid: false,
              },
            ],
            lastWeeklyNotificationAt: null,
          };
        }),
    }),
    { name: "flexi-budget-storage" },
  ),
);
