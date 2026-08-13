import { useMemo } from "react";
import { subDays } from "date-fns";
import { useBudgetStore } from "../store/useBudgetStore";
import { computeWeeklyBudget, getCategoryBreakdown } from "../lib/engine";
import { AvailableThisWeekCard } from "../components/dashboard/AvailableThisWeekCard";
import { UpcomingExpensesSection } from "../components/dashboard/UpcomingExpensesSection";
import { CategoryBreakdownSection } from "../components/dashboard/CategoryBreakdownSection";

export function Home() {
  const incomes = useBudgetStore((s) => s.incomes);
  const expenses = useBudgetStore((s) => s.expenses);

  const today = useMemo(() => new Date(), []);
  const budget = useMemo(() => computeWeeklyBudget(incomes, expenses, today), [incomes, expenses, today]);
  const categoryTotals = useMemo(
    () => getCategoryBreakdown(expenses, subDays(today, 7), today),
    [expenses, today],
  );
  const recentWeekSpend = useMemo(
    () => Object.values(categoryTotals).reduce((sum, v) => sum + v, 0),
    [categoryTotals],
  );

  return (
    <div>
      <h1 className="mb-5 text-xl font-bold" style={{ color: "var(--text-primary)" }}>
        Flexi Budget
      </h1>
      <AvailableThisWeekCard budget={budget} recentWeekSpend={recentWeekSpend} />
      <UpcomingExpensesSection lines={budget.reserves.lines} />
      <CategoryBreakdownSection totals={categoryTotals} />
    </div>
  );
}
