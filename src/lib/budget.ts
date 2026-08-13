import {
  differenceInCalendarDays,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfWeek,
  subDays,
} from "date-fns";
import { CATEGORIES, type Category, type ExpenseEntry, type FixedExpense, type IncomeEntry } from "./types";

/** Default planning horizon (in weeks) used when there is no upcoming fixed expense to plan around. */
const DEFAULT_HORIZON_WEEKS = 4;

export interface ReservedFixedExpense extends FixedExpense {
  reserved: number;
  daysUntilDue: number;
}

export interface CategoryBreakdown {
  category: Category;
  amount: number;
}

export interface BudgetSummary {
  totalIncome: number;
  totalVariableSpent: number;
  totalFixedSettled: number;
  balance: number;
  totalUpcomingNeeded: number;
  totalReserved: number;
  spendableBalance: number;
  weeksUntilNextDeadline: number;
  availableThisWeek: number;
  remainingThisWeek: number;
  spentThisWeek: number;
  weekStart: Date;
  weekEnd: Date;
  upcomingFixedExpenses: ReservedFixedExpense[];
  categoryBreakdown: CategoryBreakdown[];
  categoryTotal: number;
}

function isVariable(e: ExpenseEntry): e is ExpenseEntry & { kind: "variable" } {
  return e.kind === "variable";
}

function isFixed(e: ExpenseEntry): e is FixedExpense {
  return e.kind === "fixed";
}

export function computeBudgetSummary(
  incomes: IncomeEntry[],
  expenses: ExpenseEntry[],
  now: Date = new Date()
): BudgetSummary {
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  const variableExpenses = expenses.filter(isVariable);
  const fixedExpenses = expenses.filter(isFixed);

  const totalVariableSpent = variableExpenses.reduce((sum, e) => sum + e.amount, 0);

  const pastFixed = fixedExpenses.filter((e) => parseISO(e.dueDate) <= now);
  const upcomingFixedRaw = fixedExpenses
    .filter((e) => parseISO(e.dueDate) > now)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const totalFixedSettled = pastFixed.reduce((sum, e) => sum + e.amount, 0);
  const totalUpcomingNeeded = upcomingFixedRaw.reduce((sum, e) => sum + e.amount, 0);

  const balance = totalIncome - totalVariableSpent - totalFixedSettled;

  // Reserve money for upcoming fixed expenses. If the balance can cover everything
  // upcoming, each expense is fully reserved. Otherwise, split the balance across
  // expenses proportionally to their size, favoring nothing in particular but keeping
  // the math easy to explain.
  const coverageRatio =
    totalUpcomingNeeded > 0 ? Math.min(1, Math.max(0, balance) / totalUpcomingNeeded) : 1;

  const upcomingFixedExpenses: ReservedFixedExpense[] = upcomingFixedRaw.map((e) => ({
    ...e,
    reserved: Math.round(e.amount * coverageRatio * 100) / 100,
    daysUntilDue: differenceInCalendarDays(parseISO(e.dueDate), now),
  }));

  const totalReserved = upcomingFixedExpenses.reduce((sum, e) => sum + e.reserved, 0);

  const spendableBalance = balance - totalUpcomingNeeded;

  const nextDeadline = upcomingFixedExpenses[0];
  const weeksUntilNextDeadline = nextDeadline
    ? Math.max(1, Math.ceil(Math.max(1, nextDeadline.daysUntilDue) / 7))
    : DEFAULT_HORIZON_WEEKS;

  const availableThisWeek = Math.max(0, spendableBalance) / weeksUntilNextDeadline;

  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const spentThisWeek = variableExpenses
    .filter((e) => isWithinInterval(parseISO(e.date), { start: weekStart, end: weekEnd }))
    .reduce((sum, e) => sum + e.amount, 0);

  const remainingThisWeek = Math.max(0, availableThisWeek - spentThisWeek);

  // Category breakdown over the trailing 30 days, most recent spending period.
  const periodStart = subDays(now, 30);
  const recentVariable = variableExpenses.filter((e) => parseISO(e.date) >= periodStart);

  const categoryBreakdown: CategoryBreakdown[] = CATEGORIES.map((category) => ({
    category,
    amount: recentVariable
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0),
  }));
  const categoryTotal = categoryBreakdown.reduce((sum, c) => sum + c.amount, 0);

  return {
    totalIncome,
    totalVariableSpent,
    totalFixedSettled,
    balance,
    totalUpcomingNeeded,
    totalReserved,
    spendableBalance,
    weeksUntilNextDeadline,
    availableThisWeek,
    remainingThisWeek,
    spentThisWeek,
    weekStart,
    weekEnd,
    upcomingFixedExpenses,
    categoryBreakdown,
    categoryTotal,
  };
}

export function weekKey(date: Date): string {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return format(start, "yyyy-MM-dd");
}
