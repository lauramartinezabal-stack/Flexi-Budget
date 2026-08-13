import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { computeBudget, getPreviousWeekRange, parseDate } from '../lib/budget'
import {
  buildFixedExpenseApproachingNotifications,
  buildWeeklySummaryNotification,
} from '../lib/notifications'

/**
 * Generates the two notification types client-side. There's no push backend in
 * this prototype, so "notifications" are generated whenever the app is open and
 * surfaced in the in-app Alerts list. Each notification has a deterministic id
 * (week tag / month+expense tag) so re-running this never creates duplicates.
 */
export function useNotificationEngine() {
  const incomes = useAppStore((s) => s.incomes)
  const fixedExpenses = useAppStore((s) => s.fixedExpenses)
  const variableExpenses = useAppStore((s) => s.variableExpenses)
  const settings = useAppStore((s) => s.settings)
  const addNotificationIfNew = useAppStore((s) => s.addNotificationIfNew)

  useEffect(() => {
    const now = new Date()
    const summary = computeBudget(
      incomes,
      fixedExpenses,
      variableExpenses,
      settings.defaultHorizonWeeks,
      now,
    )

    // Only worth a "last week" digest once the account actually has activity
    // that predates last week's start — otherwise there's nothing to summarize yet.
    const activityDates = [
      ...incomes.map((i) => i.date),
      ...variableExpenses.map((e) => e.date),
      ...fixedExpenses.map((e) => e.createdAt.slice(0, 10)),
    ]
    const earliest = activityDates.length > 0 ? activityDates.sort()[0] : null
    const { start: lastWeekStart } = getPreviousWeekRange(now)
    if (earliest && parseDate(earliest) <= lastWeekStart) {
      const weekly = buildWeeklySummaryNotification(variableExpenses, summary.weeklyAvailable, now)
      addNotificationIfNew(weekly)
    }

    const approaching = buildFixedExpenseApproachingNotifications(
      fixedExpenses,
      summary.reservations,
      now,
    )
    for (const n of approaching) addNotificationIfNew(n)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomes, fixedExpenses, variableExpenses, settings.defaultHorizonWeeks])
}
