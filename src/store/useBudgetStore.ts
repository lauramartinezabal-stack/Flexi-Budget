import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppNotification, Category, Expense, IncomeEntry } from "../types";
import { checkNotifications } from "../lib/notifications";

interface BudgetState {
  incomes: IncomeEntry[];
  expenses: Expense[];
  notifications: AppNotification[];
  lastWeeklyNotificationAt: string | null;
  alertedFixedExpenseIds: string[];

  addIncome: (input: { amount: number; source?: string; date: string; note?: string }) => void;
  removeIncome: (id: string) => void;

  addVariableExpense: (input: { amount: number; category: Category; date: string; note?: string }) => void;
  addFixedExpense: (input: { amount: number; label: string; dueDate: string }) => void;
  markFixedExpensePaid: (id: string, paid: boolean) => void;
  removeExpense: (id: string) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  runNotificationCheck: () => void;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      incomes: [],
      expenses: [],
      notifications: [],
      lastWeeklyNotificationAt: null,
      alertedFixedExpenseIds: [],

      addIncome: (input) => {
        const entry: IncomeEntry = {
          id: crypto.randomUUID(),
          kind: "income",
          amount: input.amount,
          source: input.source,
          date: input.date,
          note: input.note,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ incomes: [...state.incomes, entry] }));
        get().runNotificationCheck();
      },

      removeIncome: (id) => set((state) => ({ incomes: state.incomes.filter((i) => i.id !== id) })),

      addVariableExpense: (input) => {
        const entry: Expense = {
          id: crypto.randomUUID(),
          kind: "variable",
          amount: input.amount,
          category: input.category,
          date: input.date,
          note: input.note,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ expenses: [...state.expenses, entry] }));
        get().runNotificationCheck();
      },

      addFixedExpense: (input) => {
        const entry: Expense = {
          id: crypto.randomUUID(),
          kind: "fixed",
          amount: input.amount,
          label: input.label,
          dueDate: input.dueDate,
          createdAt: new Date().toISOString(),
          paid: false,
        };
        set((state) => ({ expenses: [...state.expenses, entry] }));
        get().runNotificationCheck();
      },

      markFixedExpensePaid: (id, paid) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.kind === "fixed" && e.id === id
              ? { ...e, paid, paidAt: paid ? new Date().toISOString() : undefined }
              : e,
          ),
        })),

      removeExpense: (id) => set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      markAllNotificationsRead: () =>
        set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) })),

      runNotificationCheck: () => {
        const state = get();
        const result = checkNotifications({
          incomes: state.incomes,
          expenses: state.expenses,
          lastWeeklyNotificationAt: state.lastWeeklyNotificationAt,
          alertedFixedExpenseIds: state.alertedFixedExpenseIds,
        });
        if (result.newNotifications.length === 0) {
          if (result.lastWeeklyNotificationAt !== (state.lastWeeklyNotificationAt ?? "")) {
            set({ lastWeeklyNotificationAt: result.lastWeeklyNotificationAt || null });
          }
          return;
        }
        set({
          notifications: [...result.newNotifications, ...state.notifications],
          lastWeeklyNotificationAt: result.lastWeeklyNotificationAt || null,
          alertedFixedExpenseIds: result.alertedFixedExpenseIds,
        });
      },
    }),
    {
      name: "flexi-budget-storage",
    },
  ),
);
