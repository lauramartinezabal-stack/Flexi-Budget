import {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  endOfWeek,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";
import type { Category, FixedExpense, Income, VariableExpense } from "../types";
import { CATEGORIES } from "../types";

export const DEFAULT_HORIZON_WEEKS = 4;
export const APPROACHING_THRESHOLD_DAYS = 30;

export function toDate(iso: string): Date {
  return parseISO(iso);
}

/** Unpaid fixed expenses, soonest due date first. */
export function sortUnpaidFixedExpenses(fixedExpenses: FixedExpense[]): FixedExpense[] {
  return fixedExpenses
    .filter((e) => !e.paid)
    .slice()
    .sort((a, b) => toDate(a.dueDate).getTime() - toDate(b.dueDate).getTime());
}

/** All money in minus all money already spent or paid out, as of now. */
export function computeNetBalance(
  incomes: Income[],
  variableExpenses: VariableExpense[],
  fixedExpenses: FixedExpense[],
): number {
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalVariable = variableExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPaidFixed = fixedExpenses
    .filter((e) => e.paid)
    .reduce((sum, e) => sum + e.amount, 0);
  return totalIncome - totalVariable - totalPaidFixed;
}

export interface Reservation {
  expense: FixedExpense;
  reserved: number;
  stillNeeded: number;
}

export interface ReservationResult {
  reservations: Reservation[];
  /** Balance left over once every unpaid fixed expense has been reserved for (or fully funded). */
  freeBalance: number;
  /** Total amount still short across all unpaid fixed expenses, if the balance can't cover them all. */
  totalShortfall: number;
}

/**
 * Waterfall allocation: the balance is committed to the soonest-due fixed expense
 * first, then the next, and so on, so the app never reports money as "free" while
 * an imminent bill is still unfunded.
 */
export function computeReservations(
  netBalance: number,
  unpaidSorted: FixedExpense[],
): ReservationResult {
  let remaining = netBalance;
  const reservations: Reservation[] = unpaidSorted.map((expense) => {
    const reserved = Math.max(0, Math.min(expense.amount, remaining));
    remaining -= reserved;
    return { expense, reserved, stillNeeded: expense.amount - reserved };
  });
  const totalShortfall = reservations.reduce((sum, r) => sum + r.stillNeeded, 0);
  return { reservations, freeBalance: Math.max(0, remaining), totalShortfall };
}

/**
 * Spreads the free balance across the weeks remaining until the next bill is due,
 * so a windfall today doesn't get spent in full before that bill lands. With no
 * upcoming bills, spreads it across a default smoothing horizon instead.
 */
export function computeWeeklyAvailable(
  freeBalance: number,
  unpaidSorted: FixedExpense[],
  today: Date = new Date(),
  defaultHorizonWeeks: number = DEFAULT_HORIZON_WEEKS,
): { weeklyAvailable: number; horizonWeeks: number } {
  let horizonWeeks: number;
  if (unpaidSorted.length > 0) {
    const nearestDue = toDate(unpaidSorted[0].dueDate);
    const daysUntil = Math.max(1, differenceInCalendarDays(nearestDue, today));
    horizonWeeks = Math.max(1, Math.ceil(daysUntil / 7));
  } else {
    horizonWeeks = defaultHorizonWeeks;
  }
  return { weeklyAvailable: freeBalance / horizonWeeks, horizonWeeks };
}

export interface CategoryTotal {
  category: Category;
  total: number;
  percent: number;
}

export function computeCategoryBreakdown(
  variableExpenses: VariableExpense[],
  range?: { from: Date; to: Date },
): CategoryTotal[] {
  const inRange = range
    ? variableExpenses.filter((e) =>
        isWithinInterval(toDate(e.date), { start: startOfDay(range.from), end: endOfDay(range.to) }),
      )
    : variableExpenses;

  const grandTotal = inRange.reduce((sum, e) => sum + e.amount, 0);

  return CATEGORIES.map((category) => {
    const total = inRange
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      category,
      total,
      percent: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
    };
  });
}

export interface WeeklySummary {
  weekStart: Date;
  weekEnd: Date;
  totalSpent: number;
  byCategory: CategoryTotal[];
  newWeeklyAvailable: number;
}

/** The most recently completed Mon–Sun week, for the weekly recap notification. */
export function generateWeeklySummary(
  variableExpenses: VariableExpense[],
  weeklyAvailable: number,
  today: Date = new Date(),
): WeeklySummary {
  const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const lastWeekEnd = addDays(thisWeekStart, -1);
  const lastWeekStart = startOfWeek(lastWeekEnd, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 1 });

  const byCategory = computeCategoryBreakdown(variableExpenses, {
    from: lastWeekStart,
    to: weekEnd,
  });
  const totalSpent = byCategory.reduce((sum, c) => sum + c.total, 0);

  return { weekStart: lastWeekStart, weekEnd, totalSpent, byCategory, newWeeklyAvailable: weeklyAvailable };
}

export interface ApproachingAlert {
  expense: FixedExpense;
  reserved: number;
  stillNeeded: number;
  daysUntilDue: number;
}

/** Fixed expenses due soon, paired with how much of them is already covered. */
export function generateApproachingAlerts(
  reservations: Reservation[],
  today: Date = new Date(),
  thresholdDays: number = APPROACHING_THRESHOLD_DAYS,
): ApproachingAlert[] {
  return reservations
    .map((r) => ({
      expense: r.expense,
      reserved: r.reserved,
      stillNeeded: r.stillNeeded,
      daysUntilDue: differenceInCalendarDays(toDate(r.expense.dueDate), today),
    }))
    .filter((a) => a.daysUntilDue <= thresholdDays)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

export interface BudgetSnapshot {
  netBalance: number;
  reservationResult: ReservationResult;
  weeklyAvailable: number;
  horizonWeeks: number;
  unpaidSorted: FixedExpense[];
}

export function computeBudgetSnapshot(
  incomes: Income[],
  variableExpenses: VariableExpense[],
  fixedExpenses: FixedExpense[],
  today: Date = new Date(),
): BudgetSnapshot {
  const netBalance = computeNetBalance(incomes, variableExpenses, fixedExpenses);
  const unpaidSorted = sortUnpaidFixedExpenses(fixedExpenses);
  const reservationResult = computeReservations(netBalance, unpaidSorted);
  const { weeklyAvailable, horizonWeeks } = computeWeeklyAvailable(
    reservationResult.freeBalance,
    unpaidSorted,
    today,
  );
  return { netBalance, reservationResult, weeklyAvailable, horizonWeeks, unpaidSorted };
}
