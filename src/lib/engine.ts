import { differenceInCalendarDays } from "date-fns";
import type { Category, Expense, FixedExpense, IncomeEntry } from "../types";
import { CATEGORIES } from "../types";

export function getTotalIncome(incomes: IncomeEntry[]): number {
  return incomes.reduce((sum, i) => sum + i.amount, 0);
}

export function getTotalSpent(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => {
    if (e.kind === "variable") return sum + e.amount;
    if (e.kind === "fixed" && e.paid) return sum + e.amount;
    return sum;
  }, 0);
}

/** Total cash on hand: all income minus everything actually spent so far. */
export function getLiquidBalance(incomes: IncomeEntry[], expenses: Expense[]): number {
  return getTotalIncome(incomes) - getTotalSpent(expenses);
}

export function getActiveFixedExpenses(expenses: Expense[]): FixedExpense[] {
  return expenses
    .filter((e): e is FixedExpense => e.kind === "fixed" && !e.paid)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export interface ReserveLine {
  expense: FixedExpense;
  reserved: number;
  stillNeeded: number;
  progress: number; // 0..1
  daysUntilDue: number;
}

export interface ReserveResult {
  lines: ReserveLine[];
  totalReserved: number;
}

/**
 * Sinking-fund reserve: each fixed expense should have (elapsed / total-time-to-due)
 * of its amount set aside by today. Available cash is handed out soonest-due-first,
 * so a looming bill never gets starved by one further out.
 */
export function computeReserves(
  activeFixed: FixedExpense[],
  liquidBalance: number,
  today: Date,
): ReserveResult {
  let remaining = Math.max(liquidBalance, 0);
  const lines: ReserveLine[] = activeFixed.map((expense) => {
    const created = new Date(expense.createdAt);
    const due = new Date(expense.dueDate);
    const totalDays = Math.max(differenceInCalendarDays(due, created), 1);
    const elapsed = Math.min(Math.max(differenceInCalendarDays(today, created), 0), totalDays);
    const idealReserved = (expense.amount * elapsed) / totalDays;
    const target = Math.min(idealReserved, expense.amount);
    const reserved = Math.min(target, remaining);
    remaining -= reserved;
    const daysUntilDue = differenceInCalendarDays(due, today);
    return {
      expense,
      reserved,
      stillNeeded: Math.max(expense.amount - reserved, 0),
      progress: expense.amount > 0 ? reserved / expense.amount : 1,
      daysUntilDue,
    };
  });
  const totalReserved = lines.reduce((sum, l) => sum + l.reserved, 0);
  return { lines, totalReserved };
}

const DEFAULT_HORIZON_WEEKS = 4;

export interface WeeklyBudget {
  liquidBalance: number;
  totalReserved: number;
  spendable: number;
  horizonWeeks: number;
  weeklyAmount: number;
  reserves: ReserveResult;
}

/**
 * The headline number: cash not already earmarked for a fixed expense, spread
 * evenly across the weeks remaining until the next one comes due (or a default
 * smoothing window, if nothing is on the horizon) so a windfall doesn't vanish
 * in a day.
 */
export function computeWeeklyBudget(
  incomes: IncomeEntry[],
  expenses: Expense[],
  today: Date = new Date(),
): WeeklyBudget {
  const liquidBalance = getLiquidBalance(incomes, expenses);
  const activeFixed = getActiveFixedExpenses(expenses);
  const reserves = computeReserves(activeFixed, liquidBalance, today);
  const spendable = Math.max(liquidBalance - reserves.totalReserved, 0);

  let horizonWeeks = DEFAULT_HORIZON_WEEKS;
  const nearest = activeFixed[0];
  if (nearest) {
    const daysUntil = Math.max(differenceInCalendarDays(new Date(nearest.dueDate), today), 1);
    horizonWeeks = Math.max(Math.ceil(daysUntil / 7), 1);
  }

  const weeklyAmount = spendable / horizonWeeks;

  return { liquidBalance, totalReserved: reserves.totalReserved, spendable, horizonWeeks, weeklyAmount, reserves };
}

export function getCategoryBreakdown(
  expenses: Expense[],
  from: Date,
  to: Date,
): Record<Category, number> {
  const totals: Record<Category, number> = { food: 0, transport: 0, leisure: 0, other: 0 };
  for (const e of expenses) {
    if (e.kind !== "variable") continue;
    const d = new Date(e.date);
    if (d >= from && d <= to) totals[e.category] += e.amount;
  }
  return totals;
}

export function getCategoryTotal(totals: Record<Category, number>): number {
  return CATEGORIES.reduce((sum, c) => sum + totals[c], 0);
}

export function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
