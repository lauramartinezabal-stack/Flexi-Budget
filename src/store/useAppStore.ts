import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '../lib/id'
import { todayISO } from '../lib/format'
import type {
  AppNotification,
  Category,
  FixedExpense,
  IncomeEntry,
  Settings,
  VariableExpense,
} from '../types'

interface AppState {
  incomes: IncomeEntry[]
  fixedExpenses: FixedExpense[]
  variableExpenses: VariableExpense[]
  notifications: AppNotification[]
  settings: Settings

  addIncome: (input: { amount: number; source?: string; date: string }) => void
  removeIncome: (id: string) => void

  addFixedExpense: (input: { name: string; amount: number; dueDate: string }) => void
  removeFixedExpense: (id: string) => void
  toggleFixedExpensePaid: (id: string) => void

  addVariableExpense: (input: {
    amount: number
    category: Category
    date: string
    note?: string
  }) => void
  removeVariableExpense: (id: string) => void

  addNotificationIfNew: (notification: Omit<AppNotification, 'read'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void

  updateSettings: (patch: Partial<Settings>) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      incomes: [],
      fixedExpenses: [],
      variableExpenses: [],
      notifications: [],
      settings: { defaultHorizonWeeks: 4 },

      addIncome: (input) =>
        set((state) => ({
          incomes: [
            ...state.incomes,
            { id: genId(), createdAt: new Date().toISOString(), ...input },
          ],
        })),
      removeIncome: (id) =>
        set((state) => ({ incomes: state.incomes.filter((i) => i.id !== id) })),

      addFixedExpense: (input) =>
        set((state) => ({
          fixedExpenses: [
            ...state.fixedExpenses,
            {
              id: genId(),
              createdAt: new Date().toISOString(),
              paid: false,
              ...input,
            },
          ],
        })),
      removeFixedExpense: (id) =>
        set((state) => ({
          fixedExpenses: state.fixedExpenses.filter((e) => e.id !== id),
        })),
      toggleFixedExpensePaid: (id) =>
        set((state) => ({
          fixedExpenses: state.fixedExpenses.map((e) =>
            e.id === id ? { ...e, paid: !e.paid } : e,
          ),
        })),

      addVariableExpense: (input) =>
        set((state) => ({
          variableExpenses: [
            ...state.variableExpenses,
            { id: genId(), createdAt: new Date().toISOString(), ...input },
          ],
        })),
      removeVariableExpense: (id) =>
        set((state) => ({
          variableExpenses: state.variableExpenses.filter((e) => e.id !== id),
        })),

      addNotificationIfNew: (notification) => {
        if (get().notifications.some((n) => n.id === notification.id)) return
        set((state) => ({
          notifications: [{ ...notification, read: false }, ...state.notifications],
        }))
      },
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),
    }),
    { name: 'flexi-budget-storage' },
  ),
)

export function defaultDate(): string {
  return todayISO()
}
