import { addDays, differenceInCalendarDays, parseISO } from "date-fns";
import type { AppState, Category, FixedExpense } from "../types";

const DEFAULT_HORIZON_DAYS = 28;

export interface ReservedFixedExpense extends FixedExpense {
  reserved: number;
  stillNeeded: number;
}

export interface BudgetSummary {
  totalIncome: number;
  totalSpent: number;
  balance: number;
  reservedTotal: number;
  spendablePool: number;
  availableThisWeek: number;
  horizonDate: string;
  weeksRemaining: number;
  reservedFixedExpenses: ReservedFixedExpense[];
}

export function computeBudgetSummary(state: AppState, today: Date = new Date()): BudgetSummary {
  const totalIncome = sum(state.income.map((e) => e.amount));
  const totalVariableSpent = sum(state.variableExpenses.map((e) => e.amount));
  const paidFixedTotal = sum(state.fixedExpenses.filter((e) => e.paid).map((e) => e.amount));
  const totalSpent = totalVariableSpent + paidFixedTotal;
  const balance = Math.max(0, totalIncome - totalSpent);

  const unpaidFixed = state.fixedExpenses
    .filter((e) => !e.paid)
    .slice()
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // Reserve balance for the soonest-due fixed expenses first, since those
  // deadlines are the ones a shortfall would actually hit.
  let remaining = balance;
  const reservedFixedExpenses: ReservedFixedExpense[] = unpaidFixed.map((expense) => {
    const reserved = Math.min(expense.amount, remaining);
    remaining -= reserved;
    return { ...expense, reserved, stillNeeded: expense.amount - reserved };
  });

  const reservedTotal = sum(reservedFixedExpenses.map((e) => e.reserved));
  const spendablePool = Math.max(0, balance - reservedTotal);

  const underfunded = reservedFixedExpenses.filter((e) => e.stillNeeded > 0);
  let horizonDate: string;
  if (underfunded.length > 0) {
    horizonDate = underfunded[0].dueDate;
  } else if (reservedFixedExpenses.length > 0) {
    horizonDate = reservedFixedExpenses[0].dueDate;
  } else {
    horizonDate = toISODate(addDays(today, DEFAULT_HORIZON_DAYS));
  }

  const daysUntilHorizon = Math.max(0, differenceInCalendarDays(parseISO(horizonDate), today));
  const weeksRemaining = Math.max(1, Math.ceil(daysUntilHorizon / 7));
  const availableThisWeek = spendablePool / weeksRemaining;

  return {
    totalIncome,
    totalSpent,
    balance,
    reservedTotal,
    spendablePool,
    availableThisWeek,
    horizonDate,
    weeksRemaining,
    reservedFixedExpenses,
  };
}

export function categoryBreakdown(
  variableExpenses: AppState["variableExpenses"],
  from: Date,
  to: Date
): Record<Category, number> {
  const totals: Record<Category, number> = { food: 0, transport: 0, leisure: 0, other: 0 };
  for (const expense of variableExpenses) {
    const d = parseISO(expense.date);
    if (d >= from && d <= to) {
      totals[expense.category] += expense.amount;
    }
  }
  return totals;
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}
