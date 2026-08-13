import {
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  endOfWeek,
  isWithinInterval,
  startOfWeek,
  subWeeks,
} from 'date-fns'
import type { Category, FixedExpense, IncomeEntry, VariableExpense } from '../types'
import { CATEGORIES } from '../types'

const WEEK_OPTIONS = { weekStartsOn: 1 as const } // Monday

export function parseDate(iso: string): Date {
  return new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''))
}

export function getCurrentWeekRange(asOf: Date = new Date()) {
  return {
    start: startOfWeek(asOf, WEEK_OPTIONS),
    end: endOfWeek(asOf, WEEK_OPTIONS),
  }
}

export function getPreviousWeekRange(asOf: Date = new Date()) {
  const lastWeekAnchor = subWeeks(asOf, 1)
  return {
    anchor: lastWeekAnchor,
    start: startOfWeek(lastWeekAnchor, WEEK_OPTIONS),
    end: endOfWeek(lastWeekAnchor, WEEK_OPTIONS),
  }
}

export interface ReservationResult {
  /** amount currently set aside for this expense */
  reserved: number
  /** 0-1 share of the full amount that's covered so far */
  coverage: number
}

export interface BudgetSummary {
  totalIncome: number
  totalVariableSpent: number
  totalPaidFixed: number
  /** cash on hand, before setting anything aside for upcoming fixed expenses */
  currentBalance: number
  /** sum of money actually reserved across all unpaid fixed expenses */
  totalReserved: number
  /** cash on hand minus what's reserved for upcoming fixed expenses */
  freeBalance: number
  /** number of weeks the free balance is spread across */
  horizonWeeks: number
  /** the "safe to spend" figure for the current (and, if nothing changes, every) week */
  weeklyAvailable: number
  /** reserved amount per fixed expense id */
  reservations: Record<string, ReservationResult>
  /** nearest unpaid fixed expense due date driving the horizon, if any */
  nearestDueDate: string | null
}

export function computeBudget(
  incomes: IncomeEntry[],
  fixedExpenses: FixedExpense[],
  variableExpenses: VariableExpense[],
  defaultHorizonWeeks: number,
  asOf: Date = new Date(),
): BudgetSummary {
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)
  const totalVariableSpent = variableExpenses.reduce((sum, e) => sum + e.amount, 0)
  const paidFixed = fixedExpenses.filter((e) => e.paid)
  const unpaidFixed = fixedExpenses.filter((e) => !e.paid)
  const totalPaidFixed = paidFixed.reduce((sum, e) => sum + e.amount, 0)

  const currentBalance = totalIncome - totalVariableSpent - totalPaidFixed

  // Fund whichever bill is due soonest first: it's the one that can't wait on
  // future income arriving in time. Later bills get whatever cash is left.
  const soonestFirst = [...unpaidFixed].sort(
    (a, b) => parseDate(a.dueDate).getTime() - parseDate(b.dueDate).getTime(),
  )
  const reservations: Record<string, ReservationResult> = {}
  let remainingCash = Math.max(0, currentBalance)
  for (const expense of soonestFirst) {
    const reserved = Math.min(expense.amount, remainingCash)
    remainingCash -= reserved
    reservations[expense.id] = {
      reserved,
      coverage: expense.amount > 0 ? reserved / expense.amount : 1,
    }
  }
  const totalReserved = Object.values(reservations).reduce((sum, r) => sum + r.reserved, 0)
  const freeBalance = currentBalance - totalReserved

  const upcoming = unpaidFixed
    .filter((e) => differenceInCalendarDays(parseDate(e.dueDate), asOf) >= 0)
    .sort((a, b) => parseDate(a.dueDate).getTime() - parseDate(b.dueDate).getTime())

  let horizonWeeks = defaultHorizonWeeks
  let nearestDueDate: string | null = null
  if (upcoming.length > 0) {
    nearestDueDate = upcoming[0].dueDate
    const daysUntil = differenceInCalendarDays(parseDate(nearestDueDate), asOf)
    horizonWeeks = Math.max(1, Math.ceil((daysUntil + 1) / 7))
  }

  const weeklyAvailable = freeBalance / horizonWeeks

  return {
    totalIncome,
    totalVariableSpent,
    totalPaidFixed,
    currentBalance,
    totalReserved,
    freeBalance,
    horizonWeeks,
    weeklyAvailable,
    reservations,
    nearestDueDate,
  }
}

export interface CategoryBreakdownItem {
  category: Category
  label: string
  icon: string
  total: number
  percent: number
}

/**
 * A user's typical weekly spend, used only to judge whether the current
 * "available this week" figure is unusually tight relative to their own habits.
 */
export function computeAverageWeeklySpend(
  variableExpenses: VariableExpense[],
  asOf: Date = new Date(),
): number {
  if (variableExpenses.length === 0) return 0
  const earliest = variableExpenses.reduce(
    (min, e) => (e.date < min ? e.date : min),
    variableExpenses[0].date,
  )
  const weeks = Math.max(1, differenceInCalendarWeeks(asOf, parseDate(earliest), WEEK_OPTIONS) + 1)
  const total = variableExpenses.reduce((sum, e) => sum + e.amount, 0)
  return total / weeks
}

export function getCategoryBreakdownForRange(
  variableExpenses: VariableExpense[],
  start: Date,
  end: Date,
): { items: CategoryBreakdownItem[]; total: number } {
  const inRange = variableExpenses.filter((e) => isWithinInterval(parseDate(e.date), { start, end }))

  const totals = new Map<Category, number>()
  for (const c of CATEGORIES) totals.set(c.id, 0)
  for (const e of inRange) totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount)

  const total = inRange.reduce((sum, e) => sum + e.amount, 0)
  const items: CategoryBreakdownItem[] = CATEGORIES.map((c) => ({
    category: c.id,
    label: c.label,
    icon: c.icon,
    total: totals.get(c.id) ?? 0,
    percent: total > 0 ? (totals.get(c.id) ?? 0) / total : 0,
  }))

  return { items, total }
}

export function getCategoryBreakdown(
  variableExpenses: VariableExpense[],
  asOf: Date = new Date(),
): { items: CategoryBreakdownItem[]; total: number; isFallbackAllTime: boolean } {
  const { start, end } = getCurrentWeekRange(asOf)
  const currentWeek = getCategoryBreakdownForRange(variableExpenses, start, end)
  if (currentWeek.total > 0) return { ...currentWeek, isFallbackAllTime: false }

  const allTimeStart = new Date(0)
  const allTime = getCategoryBreakdownForRange(variableExpenses, allTimeStart, end)
  return { ...allTime, isFallbackAllTime: allTime.total > 0 }
}
