import {
  addDays,
  differenceInCalendarDays,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfWeek,
} from 'date-fns'
import type { AppNotification, AppState, Category, Entry, FixedExpense, Income, VariableExpense } from './types'
import { CATEGORIES } from './types'

const DEFAULT_WEEKS_RUNWAY = 4

export const isIncome = (e: Entry): e is Income => e.kind === 'income'
export const isVariable = (e: Entry): e is VariableExpense => e.kind === 'variable'
export const isFixed = (e: Entry): e is FixedExpense => e.kind === 'fixed'

export function totalIncome(entries: Entry[]): number {
  return entries.filter(isIncome).reduce((sum, e) => sum + e.amount, 0)
}

export function totalVariableSpent(entries: Entry[]): number {
  return entries.filter(isVariable).reduce((sum, e) => sum + e.amount, 0)
}

export function totalFixedPaid(entries: Entry[]): number {
  return entries
    .filter(isFixed)
    .filter((e) => e.paid)
    .reduce((sum, e) => sum + e.amount, 0)
}

/** Cash actually on hand: everything earned, minus everything actually spent so far. */
export function currentBalance(entries: Entry[]): number {
  return totalIncome(entries) - totalVariableSpent(entries) - totalFixedPaid(entries)
}

export function upcomingFixedExpenses(entries: Entry[]): FixedExpense[] {
  return entries
    .filter(isFixed)
    .filter((e) => !e.paid)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

export interface ReservationInfo {
  expense: FixedExpense
  reserved: number
  stillNeeded: number
}

/**
 * Reserves cash for upcoming fixed expenses in due-date order, soonest first,
 * so the closest bill is protected before money is set aside for a later one.
 */
export function computeReservations(entries: Entry[]): { reservations: ReservationInfo[]; totalReserved: number } {
  const balance = currentBalance(entries)
  const upcoming = upcomingFixedExpenses(entries)
  let remaining = Math.max(0, balance)
  const reservations: ReservationInfo[] = []
  for (const expense of upcoming) {
    const reserved = Math.min(remaining, expense.amount)
    remaining -= reserved
    reservations.push({ expense, reserved, stillNeeded: expense.amount - reserved })
  }
  const totalReserved = reservations.reduce((sum, r) => sum + r.reserved, 0)
  return { reservations, totalReserved }
}

export function freeBalance(entries: Entry[]): number {
  const balance = currentBalance(entries)
  const { totalReserved } = computeReservations(entries)
  return Math.max(0, balance - totalReserved)
}

/**
 * How many weeks of runway to spread the free balance over: driven by the
 * nearest upcoming fixed expense so spending naturally slows as a due date
 * approaches. Falls back to a default horizon when nothing is on the books.
 */
export function weeksOfRunway(entries: Entry[], today: Date = new Date()): number {
  const upcoming = upcomingFixedExpenses(entries)
  if (upcoming.length === 0) return DEFAULT_WEEKS_RUNWAY
  const nextDue = parseISO(upcoming[0].dueDate)
  const days = differenceInCalendarDays(nextDue, today)
  if (days <= 0) return 1
  return Math.max(1, Math.ceil(days / 7))
}

export function currentWeekWindow(today: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfWeek(today, { weekStartsOn: 1 }),
    end: endOfWeek(today, { weekStartsOn: 1 }),
  }
}

export function variableSpentInWindow(entries: Entry[], start: Date, end: Date): number {
  return entries
    .filter(isVariable)
    .filter((e) => isWithinInterval(parseISO(e.date), { start, end }))
    .reduce((sum, e) => sum + e.amount, 0)
}

export interface WeeklyBudget {
  weeklyAllowance: number
  spentThisWeek: number
  availableThisWeek: number
  weeks: number
}

export function computeWeeklyBudget(entries: Entry[], today: Date = new Date()): WeeklyBudget {
  const free = freeBalance(entries)
  const weeks = weeksOfRunway(entries, today)
  const weeklyAllowance = free / weeks
  const { start, end } = currentWeekWindow(today)
  const spentThisWeek = variableSpentInWindow(entries, start, end)
  const availableThisWeek = Math.max(0, weeklyAllowance - spentThisWeek)
  return { weeklyAllowance, spentThisWeek, availableThisWeek, weeks }
}

export function categoryTotals(entries: Entry[], start: Date, end: Date): { category: Category; total: number }[] {
  const totals = new Map<Category, number>(CATEGORIES.map((c) => [c.id, 0]))
  entries
    .filter(isVariable)
    .filter((e) => isWithinInterval(parseISO(e.date), { start, end }))
    .forEach((e) => totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount))
  return CATEGORIES.map((c) => ({ category: c.id, total: totals.get(c.id) ?? 0 }))
}

function weekKey(date: Date): string {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

/**
 * Simulates the weekly notification firing once a new calendar week starts:
 * summarizes the just-finished week and states the freshly recalculated
 * weekly allowance. Returns updated state only when a new notification was due.
 */
export function maybeGenerateWeeklyNotification(state: AppState, today: Date = new Date()): AppState {
  const thisWeekKey = weekKey(today)
  if (state.lastWeeklyNotificationWeekKey === thisWeekKey) return state
  // Only fire once at least one full week could have passed since first activity.
  if (state.entries.length === 0) return state

  const lastWeekEnd = addDays(startOfWeek(today, { weekStartsOn: 1 }), -1)
  const lastWeekStart = startOfWeek(lastWeekEnd, { weekStartsOn: 1 })
  const earliestEntry = state.entries.reduce<Date | null>((min, e) => {
    const d = parseISO('date' in e ? e.date : e.dueDate)
    return !min || d < min ? d : min
  }, null)
  if (!earliestEntry || earliestEntry > lastWeekEnd) {
    return { ...state, lastWeeklyNotificationWeekKey: thisWeekKey }
  }

  const totals = categoryTotals(state.entries, lastWeekStart, lastWeekEnd)
  const spent = totals.reduce((sum, t) => sum + t.total, 0)
  const budget = computeWeeklyBudget(state.entries, today)
  const lines = totals
    .filter((t) => t.total > 0)
    .map((t) => `${CATEGORIES.find((c) => c.id === t.category)?.label}: $${t.total.toFixed(2)}`)
    .join(' · ')

  const notification: AppNotification = {
    id: crypto.randomUUID(),
    type: 'weekly-summary',
    title: 'Your week in review',
    body:
      spent > 0
        ? `You spent $${spent.toFixed(2)} last week (${lines}). This week you can safely spend $${budget.availableThisWeek.toFixed(2)}.`
        : `No spending logged last week. This week you can safely spend $${budget.availableThisWeek.toFixed(2)}.`,
    createdAt: new Date().toISOString(),
    read: false,
    periodStart: format(lastWeekStart, 'yyyy-MM-dd'),
    periodEnd: format(lastWeekEnd, 'yyyy-MM-dd'),
  }

  return {
    ...state,
    notifications: [notification, ...state.notifications],
    lastWeeklyNotificationWeekKey: thisWeekKey,
  }
}

const MONTHLY_ALERT_WINDOW_DAYS = 14
const MONTHLY_ALERT_COOLDOWN_DAYS = 7

/**
 * Simulates the monthly alert: flags any unpaid fixed expense coming due
 * soon, so the user sees reserved-vs-still-needed before it's too late.
 * Re-alerts on a cooldown rather than once, since "still needed" can change.
 */
export function maybeGenerateMonthlyAlerts(state: AppState, today: Date = new Date()): AppState {
  const { reservations } = computeReservations(state.entries)
  const dueSoon = reservations.filter((r) => {
    const days = differenceInCalendarDays(parseISO(r.expense.dueDate), today)
    return days >= 0 && days <= MONTHLY_ALERT_WINDOW_DAYS
  })
  if (dueSoon.length === 0) return state

  const newNotifications: AppNotification[] = []
  for (const r of dueSoon) {
    const recentAlert = state.notifications.find(
      (n) =>
        n.type === 'monthly-alert' &&
        n.relatedExpenseId === r.expense.id &&
        differenceInCalendarDays(today, parseISO(n.createdAt)) < MONTHLY_ALERT_COOLDOWN_DAYS,
    )
    if (recentAlert) continue
    const days = differenceInCalendarDays(parseISO(r.expense.dueDate), today)
    newNotifications.push({
      id: crypto.randomUUID(),
      type: 'monthly-alert',
      title: `${r.expense.name} due in ${days} day${days === 1 ? '' : 's'}`,
      body:
        r.stillNeeded > 0
          ? `$${r.reserved.toFixed(2)} of $${r.expense.amount.toFixed(2)} reserved. Still need $${r.stillNeeded.toFixed(2)}.`
          : `$${r.expense.amount.toFixed(2)} fully reserved and ready.`,
      createdAt: new Date().toISOString(),
      read: false,
      relatedExpenseId: r.expense.id,
    })
  }
  if (newNotifications.length === 0) return state
  return { ...state, notifications: [...newNotifications, ...state.notifications] }
}
