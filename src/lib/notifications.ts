import { differenceInCalendarDays, subDays } from "date-fns";
import type { AppNotification, Expense, IncomeEntry } from "../types";
import { CATEGORY_LABELS } from "../types";
import { computeReserves, computeWeeklyBudget, getActiveFixedExpenses, getCategoryBreakdown } from "./engine";

const WEEKLY_INTERVAL_DAYS = 7;
const MONTHLY_ALERT_WINDOW_DAYS = 30;

function money(n: number): string {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export interface NotificationCheckInput {
  incomes: IncomeEntry[];
  expenses: Expense[];
  lastWeeklyNotificationAt: string | null;
  alertedFixedExpenseIds: string[];
  today?: Date;
}

export interface NotificationCheckResult {
  newNotifications: AppNotification[];
  lastWeeklyNotificationAt: string;
  alertedFixedExpenseIds: string[];
}

/**
 * Pure check: given current data + when we last notified, decide whether a
 * weekly summary and/or any monthly "expense approaching" alerts are due.
 * Called on app load / whenever the underlying data changes.
 */
export function checkNotifications(input: NotificationCheckInput): NotificationCheckResult {
  const today = input.today ?? new Date();
  const newNotifications: AppNotification[] = [];
  let lastWeeklyNotificationAt = input.lastWeeklyNotificationAt ?? "";
  const alertedFixedExpenseIds = new Set(input.alertedFixedExpenseIds);

  const daysSinceWeekly = lastWeeklyNotificationAt
    ? differenceInCalendarDays(today, new Date(lastWeeklyNotificationAt))
    : Infinity;

  const hasData = input.incomes.length > 0 || input.expenses.length > 0;
  // Start the clock on first data entry rather than notifying immediately —
  // the first weekly summary should land a week into actually using the app.
  const clockStarted = Boolean(input.lastWeeklyNotificationAt);

  if (hasData && clockStarted && daysSinceWeekly >= WEEKLY_INTERVAL_DAYS) {
    const from = subDays(today, WEEKLY_INTERVAL_DAYS);
    const breakdown = getCategoryBreakdown(input.expenses, from, today);
    const budget = computeWeeklyBudget(input.incomes, input.expenses, today);
    const lines = Object.entries(breakdown)
      .filter(([, amt]) => amt > 0)
      .map(([cat, amt]) => `${CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]} ${money(amt)}`);
    const spentSummary = lines.length ? lines.join(" · ") : "No variable spending logged";

    newNotifications.push({
      id: crypto.randomUUID(),
      type: "weekly-summary",
      createdAt: today.toISOString(),
      title: "Your week in review",
      body: `Last week: ${spentSummary}. Available this week: ${money(budget.weeklyAmount)}.`,
      read: false,
      meta: { breakdown, weeklyAmount: budget.weeklyAmount },
    });
    lastWeeklyNotificationAt = today.toISOString();
  }

  const activeFixed = getActiveFixedExpenses(input.expenses);
  const liquidBalance = computeWeeklyBudget(input.incomes, input.expenses, today).liquidBalance;
  const { lines: reserveLines } = computeReserves(activeFixed, liquidBalance, today);

  for (const line of reserveLines) {
    const withinWindow = line.daysUntilDue <= MONTHLY_ALERT_WINDOW_DAYS && line.daysUntilDue >= 0;
    if (withinWindow && !alertedFixedExpenseIds.has(line.expense.id)) {
      newNotifications.push({
        id: crypto.randomUUID(),
        type: "monthly-alert",
        createdAt: today.toISOString(),
        title: `${line.expense.label} is coming up`,
        body: `Due in ${line.daysUntilDue} day${line.daysUntilDue === 1 ? "" : "s"}. Reserved so far: ${money(
          line.reserved,
        )} of ${money(line.expense.amount)} (${money(line.stillNeeded)} still needed).`,
        read: false,
        meta: { expenseId: line.expense.id, reserved: line.reserved, stillNeeded: line.stillNeeded },
      });
      alertedFixedExpenseIds.add(line.expense.id);
    }
  }

  return {
    newNotifications,
    lastWeeklyNotificationAt: lastWeeklyNotificationAt || (hasData ? today.toISOString() : ""),
    alertedFixedExpenseIds: Array.from(alertedFixedExpenseIds),
  };
}
