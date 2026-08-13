import { addDays, endOfWeek, format, parseISO, startOfWeek } from "date-fns";
import { CATEGORIES, type ExpenseEntry, type IncomeEntry } from "./types";
import { computeBudgetSummary, type CategoryBreakdown } from "./budget";

export interface WeeklyNotification {
  id: string;
  type: "weekly";
  weekStart: string;
  weekEnd: string;
  totalSpent: number;
  categoryBreakdown: CategoryBreakdown[];
  availableNextWeek: number;
  date: string; // sort date, ISO
}

export interface MonthlyNotification {
  id: string;
  type: "monthly";
  expenseName: string;
  amount: number;
  reserved: number;
  dueDate: string;
  daysUntilDue: number;
  date: string;
}

export type AppNotification = WeeklyNotification | MonthlyNotification;

const MONTHLY_LOOKAHEAD_DAYS = 30;
const MAX_WEEKLY_NOTIFICATIONS = 8;

export function generateNotifications(
  incomes: IncomeEntry[],
  expenses: ExpenseEntry[],
  now: Date = new Date()
): AppNotification[] {
  const notifications: AppNotification[] = [];

  // --- Weekly notifications: one per completed week (Mon-Sun) that has data ---
  const allDates = [
    ...incomes.map((i) => i.date),
    ...expenses.map((e) => (e.kind === "variable" ? e.date : e.dueDate)),
  ];

  if (allDates.length > 0) {
    const earliest = allDates.reduce((min, d) => (d < min ? d : min), allDates[0]);
    let cursor = startOfWeek(parseISO(earliest), { weekStartsOn: 1 });
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });

    const weeks: { start: Date; end: Date }[] = [];
    while (cursor < currentWeekStart) {
      weeks.push({ start: cursor, end: endOfWeek(cursor, { weekStartsOn: 1 }) });
      cursor = addDays(cursor, 7);
    }

    const recentWeeks = weeks.slice(-MAX_WEEKLY_NOTIFICATIONS);

    for (const { start, end } of recentWeeks) {
      const variableInWeek = expenses.filter(
        (e) => e.kind === "variable" && parseISO(e.date) >= start && parseISO(e.date) <= end
      );
      if (variableInWeek.length === 0) continue;

      const totalSpent = variableInWeek.reduce((sum, e) => sum + e.amount, 0);
      const categoryBreakdown: CategoryBreakdown[] = CATEGORIES.map((category) => ({
        category,
        amount: variableInWeek
          .filter((e) => e.kind === "variable" && e.category === category)
          .reduce((sum, e) => sum + e.amount, 0),
      }));

      // "Available this week" as it would have been computed the Monday after this week ended.
      const asOf = addDays(end, 1);
      const summary = computeBudgetSummary(incomes, expenses, asOf);

      notifications.push({
        id: `weekly-${format(start, "yyyy-MM-dd")}`,
        type: "weekly",
        weekStart: format(start, "yyyy-MM-dd"),
        weekEnd: format(end, "yyyy-MM-dd"),
        totalSpent,
        categoryBreakdown,
        availableNextWeek: summary.availableThisWeek,
        date: format(asOf, "yyyy-MM-dd"),
      });
    }
  }

  // --- Monthly notifications: fixed expenses approaching within 30 days ---
  const summary = computeBudgetSummary(incomes, expenses, now);
  for (const fx of summary.upcomingFixedExpenses) {
    if (fx.daysUntilDue <= MONTHLY_LOOKAHEAD_DAYS) {
      notifications.push({
        id: `monthly-${fx.id}`,
        type: "monthly",
        expenseName: fx.name,
        amount: fx.amount,
        reserved: fx.reserved,
        dueDate: fx.dueDate,
        daysUntilDue: fx.daysUntilDue,
        date: format(now, "yyyy-MM-dd"),
      });
    }
  }

  return notifications.sort((a, b) => b.date.localeCompare(a.date));
}
