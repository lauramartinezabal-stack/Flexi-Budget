import {
  addMonths,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  endOfWeek,
  isWithinInterval,
  startOfWeek,
  subWeeks,
} from 'date-fns'
import type { Category, FixedExpense, IncomeEntry, SavingsGoal, VariableExpense } from '../types'
import { CATEGORIES } from '../types'

const WEEK_OPTIONS = { weekStartsOn: 1 as const } // Monday

export function parseDate(iso: string): Date {
  return new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''))
}

export function formatISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Advances an ISO date by n months, clamped to the end of the resulting month. */
export function addMonthsISO(iso: string, n: number): string {
  return formatISODate(addMonths(parseDate(iso), n))
}

/**
 * How many monthly occurrences of a recurring amount have happened by `asOf`,
 * counting the start date itself as the first occurrence. Used for both
 * recurring income ("scholarship, €300/month since Sep") and recurring
 * savings contributions.
 */
export function countMonthlyOccurrences(
  startDateIso: string,
  endDateIso: string | undefined,
  asOf: Date,
): number {
  const start = parseDate(startDateIso)
  const cutoff = endDateIso && parseDate(endDateIso) < asOf ? parseDate(endDateIso) : asOf
  if (cutoff < start) return 0
  let n = 0
  while (addMonths(start, n) <= cutoff) n++
  return n
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

/**
 * The amount a savings goal should have by now: the flat target for a
 * one-off goal, or however much a monthly fund has accrued so far.
 */
export function effectiveSavingsTarget(goal: SavingsGoal, asOf: Date): number {
  if (goal.monthlyContribution != null && goal.startDate) {
    const months = countMonthlyOccurrences(goal.startDate, goal.endDate, asOf)
    return goal.monthlyContribution * months
  }
  return goal.targetAmount ?? 0
}

export interface BudgetSummary {
  totalIncome: number
  totalVariableSpent: number
  totalPaidFixed: number
  totalSaved: number
  /** cash on hand, before setting anything aside for bills or savings goals */
  currentBalance: number
  /** sum of money actually reserved across all unpaid fixed expenses */
  totalReserved: number
  /** sum of money actually reserved across all unfinished savings goals */
  totalReservedSavings: number
  /** cash on hand minus what's reserved for bills and savings goals */
  freeBalance: number
  /** number of weeks the free balance is spread across */
  horizonWeeks: number
  /** the "safe to spend" figure for the current (and, if nothing changes, every) week */
  weeklyAvailable: number
  /** reserved amount per fixed expense id */
  reservations: Record<string, ReservationResult>
  /** reserved amount per savings goal id */
  savingsReservations: Record<string, ReservationResult>
  /** nearest unpaid fixed expense due date driving the horizon, if any */
  nearestDueDate: string | null
}

export function computeBudget(
  incomes: IncomeEntry[],
  fixedExpenses: FixedExpense[],
  variableExpenses: VariableExpense[],
  savingsGoals: SavingsGoal[],
  defaultHorizonWeeks: number,
  asOf: Date = new Date(),
): BudgetSummary {
  const totalIncome = incomes.reduce(
    (sum, i) =>
      sum + (i.recurring ? i.amount * countMonthlyOccurrences(i.date, i.recurring.endDate, asOf) : i.amount),
    0,
  )
  const totalVariableSpent = variableExpenses.reduce((sum, e) => sum + e.amount, 0)
  const unpaidFixed = fixedExpenses.filter((e) => !e.paid)
  const totalPaidFixed = fixedExpenses.reduce(
    (sum, e) => sum + (e.recurring ? e.totalPaidToDate : e.paid ? e.amount : 0),
    0,
  )
  const achievedGoals = savingsGoals.filter((g) => g.achieved)
  const unachievedGoals = savingsGoals.filter((g) => !g.achieved)
  const totalSaved = achievedGoals.reduce((sum, g) => sum + effectiveSavingsTarget(g, asOf), 0)

  const currentBalance = totalIncome - totalVariableSpent - totalPaidFixed - totalSaved

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

  // Savings goals only get whatever's left after bills: goals with a target
  // date go first (soonest first), undated goals fill in after, oldest first.
  const goalsByPriority = [...unachievedGoals].sort((a, b) => {
    if (a.targetDate && b.targetDate) {
      return parseDate(a.targetDate).getTime() - parseDate(b.targetDate).getTime()
    }
    if (a.targetDate) return -1
    if (b.targetDate) return 1
    return a.createdAt.localeCompare(b.createdAt)
  })
  const savingsReservations: Record<string, ReservationResult> = {}
  for (const goal of goalsByPriority) {
    const target = effectiveSavingsTarget(goal, asOf)
    const reserved = Math.min(target, remainingCash)
    remainingCash -= reserved
    savingsReservations[goal.id] = {
      reserved,
      coverage: target > 0 ? reserved / target : 1,
    }
  }
  const totalReservedSavings = Object.values(savingsReservations).reduce(
    (sum, r) => sum + r.reserved,
    0,
  )

  const freeBalance = currentBalance - totalReserved - totalReservedSavings

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
    totalSaved,
    currentBalance,
    totalReserved,
    totalReservedSavings,
    freeBalance,
    horizonWeeks,
    weeklyAvailable,
    reservations,
    savingsReservations,
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

export interface CategoryCapItem extends CategoryBreakdownItem {
  /** suggested cap for this category out of this week's available amount */
  cap: number
  /** what's been spent in this category so far this (current, in-progress) week */
  spentThisWeek: number
  /** cap minus spent, floored at 0 */
  remaining: number
  /** how much spending exceeds the cap, 0 if under */
  over: number
}

/**
 * A sensible starting split before we know anything about the user: food is
 * the biggest necessity, transport modest, leisure meaningful but capped,
 * other is a small buffer. Used until there's enough logged history to trust
 * their own pattern instead.
 */
export const DEFAULT_CATEGORY_SPLIT: Record<Category, number> = {
  food: 0.4,
  transport: 0.15,
  leisure: 0.25,
  other: 0.2,
}

/** Minimum logged expenses before switching from the sensible default to a learned split. */
const MIN_HISTORY_FOR_PERSONALIZATION = 8

/**
 * Splits "available this week" across categories. Starts from a sensible
 * default split (food gets the biggest share, since it's the necessity most
 * likely to get crowded out by discretionary spending) and switches to the
 * user's own historical ratio once there's enough logged history to trust it.
 */
export function computeCategorySplit(
  weeklyAvailable: number,
  variableExpenses: VariableExpense[],
  asOf: Date = new Date(),
): { items: CategoryCapItem[]; isPersonalized: boolean } {
  const spendableThisWeek = Math.max(0, weeklyAvailable)
  const { start, end } = getCurrentWeekRange(asOf)
  const spentThisWeekByCategory = getCategoryBreakdownForRange(variableExpenses, start, end)

  const historyTotal = variableExpenses.reduce((sum, e) => sum + e.amount, 0)
  const isPersonalized = variableExpenses.length >= MIN_HISTORY_FOR_PERSONALIZATION && historyTotal > 0
  const historyByCategory = new Map<Category, number>()
  for (const c of CATEGORIES) historyByCategory.set(c.id, 0)
  for (const e of variableExpenses) {
    historyByCategory.set(e.category, (historyByCategory.get(e.category) ?? 0) + e.amount)
  }

  const items: CategoryCapItem[] = CATEGORIES.map((c) => {
    const ratio = isPersonalized ? (historyByCategory.get(c.id) ?? 0) / historyTotal : DEFAULT_CATEGORY_SPLIT[c.id]
    const cap = spendableThisWeek * ratio
    const spentThisWeek =
      spentThisWeekByCategory.items.find((i) => i.category === c.id)?.total ?? 0
    return {
      category: c.id,
      label: c.label,
      icon: c.icon,
      total: spentThisWeek,
      percent: spendableThisWeek > 0 ? cap / spendableThisWeek : 0,
      cap,
      spentThisWeek,
      remaining: Math.max(0, cap - spentThisWeek),
      over: Math.max(0, spentThisWeek - cap),
    }
  })

  return { items, isPersonalized }
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
