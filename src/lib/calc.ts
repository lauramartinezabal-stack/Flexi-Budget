import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import type {
  ExpenseCategory,
  ExpenseEntry,
  FixedExpense,
  IncomeEntry,
} from "../types";

export interface FixedReservation {
  expense: FixedExpense;
  reserved: number;
  needed: number;
  daysUntilDue: number;
}

export type BudgetStatus = "calm" | "warning" | "critical";

export interface BudgetSummary {
  totalIncome: number;
  totalVariableSpent: number;
  paidFixedTotal: number;
  balance: number;
  totalReservedForFixed: number;
  totalStillNeeded: number;
  freeToAllocate: number;
  horizonDays: number;
  horizonWeeks: number;
  weeklyAvailable: number;
  reservations: FixedReservation[];
  unpaidFixed: FixedExpense[];
  status: BudgetStatus;
}

function isOnOrBefore(dateIso: string, today: Date): boolean {
  return differenceInCalendarDays(today, parseISO(dateIso)) >= 0;
}

export function computeBudget(
  incomes: IncomeEntry[],
  expenses: ExpenseEntry[],
  today: Date = new Date(),
): BudgetSummary {
  const day = startOfDay(today);

  const totalIncome = incomes
    .filter((i) => isOnOrBefore(i.date, day))
    .reduce((sum, i) => sum + i.amount, 0);

  const variable = expenses.filter(
    (e): e is Extract<ExpenseEntry, { kind: "variable" }> =>
      e.kind === "variable",
  );
  const fixed = expenses.filter(
    (e): e is FixedExpense => e.kind === "fixed",
  );

  const totalVariableSpent = variable
    .filter((e) => isOnOrBefore(e.date, day))
    .reduce((sum, e) => sum + e.amount, 0);

  const paidFixedTotal = fixed
    .filter((e) => e.paid)
    .reduce((sum, e) => sum + e.amount, 0);

  const balance = totalIncome - totalVariableSpent - paidFixedTotal;

  const unpaidFixed = fixed
    .filter((e) => !e.paid)
    .sort(
      (a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime(),
    );

  let pool = balance;
  const reservations: FixedReservation[] = unpaidFixed.map((expense) => {
    const reserved = Math.min(Math.max(pool, 0), expense.amount);
    pool -= reserved;
    return {
      expense,
      reserved,
      needed: expense.amount - reserved,
      daysUntilDue: differenceInCalendarDays(parseISO(expense.dueDate), day),
    };
  });

  const totalReservedForFixed = reservations.reduce(
    (sum, r) => sum + r.reserved,
    0,
  );
  const totalStillNeeded = reservations.reduce((sum, r) => sum + r.needed, 0);

  const freeToAllocate = pool;

  const nearestDue = unpaidFixed[0]?.dueDate;
  const horizonDays = nearestDue
    ? Math.max(1, differenceInCalendarDays(parseISO(nearestDue), day))
    : 7;
  const horizonWeeks = Math.max(1, Math.ceil(horizonDays / 7));

  const weeklyAvailable = freeToAllocate / horizonWeeks;

  let status: BudgetStatus = "calm";
  if (weeklyAvailable <= 0) {
    status = "critical";
  } else if (
    reservations.some((r) => r.needed > 0 && r.daysUntilDue <= 7)
  ) {
    status = "warning";
  }

  return {
    totalIncome,
    totalVariableSpent,
    paidFixedTotal,
    balance,
    totalReservedForFixed,
    totalStillNeeded,
    freeToAllocate,
    horizonDays,
    horizonWeeks,
    weeklyAvailable,
    reservations,
    unpaidFixed,
    status,
  };
}

export interface CategoryBreakdownItem {
  category: ExpenseCategory;
  total: number;
  percent: number;
}

export function getCategoryBreakdown(
  expenses: ExpenseEntry[],
  today: Date = new Date(),
  days = 7,
): { items: CategoryBreakdownItem[]; total: number; periodStart: Date; periodEnd: Date } {
  const day = startOfDay(today);
  const periodStart = addDays(day, -(days - 1));

  const variable = expenses.filter(
    (e): e is Extract<ExpenseEntry, { kind: "variable" }> =>
      e.kind === "variable",
  );

  const inPeriod = variable.filter((e) => {
    const d = parseISO(e.date);
    return d >= periodStart && d <= day;
  });

  const totals = new Map<ExpenseCategory, number>();
  for (const e of inPeriod) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
  }

  const total = inPeriod.reduce((sum, e) => sum + e.amount, 0);

  const items: CategoryBreakdownItem[] = Array.from(totals.entries())
    .map(([category, catTotal]) => ({
      category,
      total: catTotal,
      percent: total > 0 ? (catTotal / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return { items, total, periodStart, periodEnd: day };
}

export interface AppNotification {
  id: string;
  type: "weekly" | "monthly";
  title: string;
  body: string;
  urgent: boolean;
  date: Date;
}

export function generateNotifications(
  incomes: IncomeEntry[],
  expenses: ExpenseEntry[],
  today: Date = new Date(),
): AppNotification[] {
  const day = startOfDay(today);
  const budget = computeBudget(incomes, expenses, day);
  const { items, total, periodStart } = getCategoryBreakdown(
    expenses,
    day,
    7,
  );

  const notifications: AppNotification[] = [];

  if (incomes.length > 0 || expenses.length > 0) {
    const breakdownText =
      items.length > 0
        ? items
            .map(
              (i) =>
                `${i.category[0].toUpperCase()}${i.category.slice(1)} ${Math.round(i.percent)}%`,
            )
            .join(" · ")
        : "No spending logged yet";

    notifications.push({
      id: "weekly-summary",
      type: "weekly",
      title: "Your week in review",
      body: `${format(periodStart, "MMM d")} – ${format(day, "MMM d")}: you spent a total of ${total.toFixed(2)}€ (${breakdownText}). Available for the upcoming week: ${budget.weeklyAvailable.toFixed(2)}€.`,
      urgent: false,
      date: day,
    });
  }

  for (const r of budget.reservations) {
    if (r.daysUntilDue <= 30) {
      notifications.push({
        id: `monthly-${r.expense.id}`,
        type: "monthly",
        title: `${r.expense.name} is approaching`,
        body: `Due ${format(parseISO(r.expense.dueDate), "MMM d")} (${r.daysUntilDue} day${r.daysUntilDue === 1 ? "" : "s"}). Reserved ${r.reserved.toFixed(2)}€ of ${r.expense.amount.toFixed(2)}€${r.needed > 0 ? ` — still need ${r.needed.toFixed(2)}€.` : " — fully covered."}`,
        urgent: r.daysUntilDue <= 7 && r.needed > 0,
        date: day,
      });
    }
  }

  return notifications.sort((a, b) => Number(b.urgent) - Number(a.urgent));
}
