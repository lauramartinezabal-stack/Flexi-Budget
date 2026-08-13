import { addDays, differenceInCalendarDays, parseISO, startOfWeek, subWeeks } from "date-fns";
import type { AppState, NotificationItem } from "../types";
import { CATEGORY_LABELS } from "../types";
import { categoryBreakdown, computeBudgetSummary, toISODate } from "./budget";
import { makeId } from "./id";

const FIXED_EXPENSE_ALERT_WINDOW_DAYS = 30;

function weekKeyOf(date: Date): string {
  return toISODate(startOfWeek(date, { weekStartsOn: 1 }));
}

/** Builds a notification summarizing the week that just ended, once per new week. */
export function buildWeeklySummaryNotification(
  state: AppState,
  today: Date = new Date()
): { notification: NotificationItem | null; weekKey: string } {
  const weekKey = weekKeyOf(today);
  if (state.lastWeeklySummaryWeekKey === weekKey) {
    return { notification: null, weekKey };
  }
  // First-ever load: nothing to summarize yet, just start tracking weeks.
  if (!state.lastWeeklySummaryWeekKey) {
    return { notification: null, weekKey };
  }

  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const prevWeekStart = subWeeks(currentWeekStart, 1);
  const prevWeekEnd = addDays(currentWeekStart, -1);

  const totals = categoryBreakdown(state.variableExpenses, prevWeekStart, prevWeekEnd);
  const totalSpent = Object.values(totals).reduce((a, b) => a + b, 0);
  const summary = computeBudgetSummary(state, today);

  const lines = Object.entries(totals)
    .filter(([, amount]) => amount > 0)
    .map(([cat, amount]) => `${CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}: $${amount.toFixed(2)}`)
    .join(", ");

  const body =
    totalSpent > 0
      ? `Last week you spent $${totalSpent.toFixed(2)} (${lines}). Available this week: $${summary.availableThisWeek.toFixed(2)}.`
      : `No spending logged last week. Available this week: $${summary.availableThisWeek.toFixed(2)}.`;

  return {
    notification: {
      id: makeId(),
      kind: "weekly-summary",
      title: "Your weekly summary",
      body,
      createdAt: new Date().toISOString(),
      read: false,
    },
    weekKey,
  };
}

/** Alerts once when an unpaid fixed expense enters its due-date window. */
export function buildFixedExpenseAlerts(
  state: AppState,
  today: Date = new Date()
): NotificationItem[] {
  const alerted = new Set(
    state.notifications
      .filter((n) => n.kind === "fixed-expense-approaching")
      .map((n) => String(n.meta?.expenseId))
  );

  const alerts: NotificationItem[] = [];
  for (const expense of state.fixedExpenses) {
    if (expense.paid || alerted.has(expense.id)) continue;
    const daysUntil = differenceInCalendarDays(parseISO(expense.dueDate), today);
    if (daysUntil < 0 || daysUntil > FIXED_EXPENSE_ALERT_WINDOW_DAYS) continue;

    const summary = computeBudgetSummary(state, today);
    const reserved = summary.reservedFixedExpenses.find((e) => e.id === expense.id);
    const reservedAmount = reserved?.reserved ?? 0;
    const stillNeeded = reserved?.stillNeeded ?? expense.amount;

    alerts.push({
      id: makeId(),
      kind: "fixed-expense-approaching",
      title: `${expense.name} is coming up`,
      body:
        stillNeeded > 0
          ? `Due ${expense.dueDate} — $${reservedAmount.toFixed(2)} of $${expense.amount.toFixed(2)} reserved, $${stillNeeded.toFixed(2)} still needed.`
          : `Due ${expense.dueDate} — the full $${expense.amount.toFixed(2)} is reserved and ready.`,
      createdAt: new Date().toISOString(),
      read: false,
      meta: { expenseId: expense.id },
    });
  }
  return alerts;
}
