import { differenceInCalendarDays, getISOWeek, getISOWeekYear } from 'date-fns'
import { formatCurrency } from './format'
import { getCategoryBreakdownForRange, getPreviousWeekRange } from './budget'
import type { AppNotification, CurrencyCode, FixedExpense, VariableExpense } from '../types'

const APPROACHING_WINDOW_DAYS = 14

/**
 * Fires once per ISO week (deduped by id), summarizing the week that just
 * ended. Only makes sense once a full previous week has actually happened,
 * so callers should gate this on the account having some history already.
 */
export function buildWeeklySummaryNotification(
  variableExpenses: VariableExpense[],
  weeklyAvailable: number,
  currency: CurrencyCode,
  asOf: Date,
): AppNotification {
  const { anchor, start, end } = getPreviousWeekRange(asOf)
  const weekTag = `${getISOWeekYear(anchor)}-W${String(getISOWeek(anchor)).padStart(2, '0')}`
  const { items, total } = getCategoryBreakdownForRange(variableExpenses, start, end)
  const nonZero = items.filter((i) => i.total > 0)

  const breakdown =
    nonZero.length > 0
      ? nonZero.map((i) => `${i.icon} ${i.label}: ${formatCurrency(i.total, currency)}`).join('  •  ')
      : 'No spending logged.'

  return {
    id: `weekly-${weekTag}`,
    kind: 'weekly-summary',
    createdAt: asOf.toISOString(),
    title: `Last week: ${formatCurrency(total, currency)} spent`,
    body: `${breakdown}\nAvailable to spend this week: ${formatCurrency(weeklyAvailable, currency)}`,
    read: false,
  }
}

export function buildFixedExpenseApproachingNotifications(
  fixedExpenses: FixedExpense[],
  reservations: Record<string, { reserved: number }>,
  currency: CurrencyCode,
  asOf: Date,
): AppNotification[] {
  const monthTag = `${asOf.getFullYear()}-${String(asOf.getMonth() + 1).padStart(2, '0')}`
  const result: AppNotification[] = []

  for (const expense of fixedExpenses) {
    if (expense.paid) continue
    const daysUntil = differenceInCalendarDays(new Date(expense.dueDate + 'T00:00:00'), asOf)
    if (daysUntil < 0 || daysUntil > APPROACHING_WINDOW_DAYS) continue

    const reserved = reservations[expense.id]?.reserved ?? 0
    const remaining = Math.max(0, expense.amount - reserved)

    result.push({
      id: `fixed-approaching-${expense.id}-${monthTag}`,
      kind: 'fixed-expense-approaching',
      createdAt: asOf.toISOString(),
      title: `"${expense.name}" is coming up`,
      body: `Due in ${daysUntil} day${daysUntil === 1 ? '' : 's'} (${formatCurrency(
        expense.amount,
        currency,
      )}). Reserved so far: ${formatCurrency(reserved, currency)}. Still needed: ${formatCurrency(
        remaining,
        currency,
      )}.`,
      read: false,
    })
  }

  return result
}
