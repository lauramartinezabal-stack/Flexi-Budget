import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '../lib/id'
import { todayISO } from '../lib/format'
import { addMonthsISO } from '../lib/budget'
import type {
  AppNotification,
  Category,
  FixedExpense,
  IncomeEntry,
  RecurrenceRule,
  SavingsGoal,
  Settings,
  VariableExpense,
} from '../types'

interface AppState {
  incomes: IncomeEntry[]
  fixedExpenses: FixedExpense[]
  variableExpenses: VariableExpense[]
  savingsGoals: SavingsGoal[]
  notifications: AppNotification[]
  settings: Settings

  addIncome: (input: {
    amount: number
    source?: string
    date: string
    recurring?: RecurrenceRule
  }) => void
  removeIncome: (id: string) => void

  addFixedExpense: (input: {
    name: string
    amount: number
    dueDate: string
    recurring?: RecurrenceRule
  }) => void
  removeFixedExpense: (id: string) => void
  /** One-off bills toggle paid/unpaid; recurring bills advance to the next monthly cycle. */
  toggleFixedExpensePaid: (id: string) => void

  addVariableExpense: (input: {
    amount: number
    category: Category
    date: string
    note?: string
  }) => void
  removeVariableExpense: (id: string) => void

  addSavingsGoal: (input: {
    name: string
    targetAmount?: number
    targetDate?: string
    monthlyContribution?: number
    startDate?: string
    endDate?: string
  }) => void
  removeSavingsGoal: (id: string) => void
  toggleSavingsGoalAchieved: (id: string) => void

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
      savingsGoals: [],
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
              totalPaidToDate: 0,
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
          fixedExpenses: state.fixedExpenses.map((e) => {
            if (e.id !== id) return e
            if (!e.recurring) return { ...e, paid: !e.paid }
            // Recurring bill: paying always advances to the next monthly cycle
            // rather than toggling back — there's no "un-pay last month's rent".
            const nextDue = addMonthsISO(e.dueDate, 1)
            const seriesEnded = !!e.recurring.endDate && nextDue > e.recurring.endDate
            return {
              ...e,
              totalPaidToDate: e.totalPaidToDate + e.amount,
              dueDate: seriesEnded ? e.dueDate : nextDue,
              paid: seriesEnded,
            }
          }),
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

      addSavingsGoal: (input) =>
        set((state) => ({
          savingsGoals: [
            ...state.savingsGoals,
            {
              id: genId(),
              createdAt: new Date().toISOString(),
              achieved: false,
              ...input,
            },
          ],
        })),
      removeSavingsGoal: (id) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((g) => g.id !== id),
        })),
      toggleSavingsGoalAchieved: (id) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) =>
            g.id === id ? { ...g, achieved: !g.achieved } : g,
          ),
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
