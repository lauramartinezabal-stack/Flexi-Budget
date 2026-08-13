import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { emptyState, loadState, saveState } from '../lib/storage'
import { maybeGenerateMonthlyAlerts, maybeGenerateWeeklyNotification } from '../lib/engine'
import type { AppState, Category, Entry, FixedExpense, Income, VariableExpense } from '../lib/types'

interface AppContextValue {
  state: AppState
  addIncome: (input: { amount: number; source?: string; date: string; note?: string }) => void
  addVariableExpense: (input: { amount: number; category: Category; date: string; note?: string }) => void
  addFixedExpense: (input: { amount: number; name: string; dueDate: string; category: Category }) => void
  markFixedPaid: (id: string, paid: boolean) => void
  deleteEntry: (id: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState() ?? emptyState())

  useEffect(() => {
    setState((prev) => {
      const withWeekly = maybeGenerateWeeklyNotification(prev)
      return maybeGenerateMonthlyAlerts(withWeekly)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    saveState(state)
  }, [state])

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      addIncome: (input) => {
        const entry: Income = {
          id: crypto.randomUUID(),
          kind: 'income',
          amount: input.amount,
          source: input.source,
          date: input.date,
          note: input.note,
          createdAt: new Date().toISOString(),
        }
        setState((prev) => ({ ...prev, entries: [entry, ...prev.entries] }))
      },
      addVariableExpense: (input) => {
        const entry: VariableExpense = {
          id: crypto.randomUUID(),
          kind: 'variable',
          amount: input.amount,
          category: input.category,
          date: input.date,
          note: input.note,
          createdAt: new Date().toISOString(),
        }
        setState((prev) => ({ ...prev, entries: [entry, ...prev.entries] }))
      },
      addFixedExpense: (input) => {
        const entry: FixedExpense = {
          id: crypto.randomUUID(),
          kind: 'fixed',
          amount: input.amount,
          name: input.name,
          dueDate: input.dueDate,
          category: input.category,
          paid: false,
          createdAt: new Date().toISOString(),
        }
        setState((prev) => ({ ...prev, entries: [entry, ...prev.entries] }))
      },
      markFixedPaid: (id, paid) => {
        setState((prev) => ({
          ...prev,
          entries: prev.entries.map((e) => (e.id === id && e.kind === 'fixed' ? { ...e, paid } : e)),
        }))
      },
      deleteEntry: (id) => {
        setState((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.id !== id) }))
      },
      markNotificationRead: (id) => {
        setState((prev) => ({
          ...prev,
          notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }))
      },
      markAllNotificationsRead: () => {
        setState((prev) => ({ ...prev, notifications: prev.notifications.map((n) => ({ ...n, read: true })) }))
      },
    }),
    [state],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export type { Entry }
