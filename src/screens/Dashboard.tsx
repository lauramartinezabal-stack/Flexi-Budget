import { useMemo } from "react";
import { AvailableCard } from "../components/AvailableCard";
import { Card, SectionTitle } from "../components/Card";
import { CategoryBreakdown } from "../components/CategoryBreakdown";
import { FixedExpenseList } from "../components/FixedExpenseList";
import { computeBudget, getCategoryBreakdown } from "../lib/calc";
import { useBudgetStore } from "../store/budgetStore";

export function Dashboard() {
  const incomes = useBudgetStore((s) => s.incomes);
  const expenses = useBudgetStore((s) => s.expenses);

  const budget = useMemo(
    () => computeBudget(incomes, expenses),
    [incomes, expenses],
  );
  const breakdown = useMemo(
    () => getCategoryBreakdown(expenses),
    [expenses],
  );

  const hasAnyData = incomes.length > 0 || expenses.length > 0;

  return (
    <div className="flex flex-col gap-5 px-5 pb-6 pt-[max(env(safe-area-inset-top),1.25rem)]">
      <p className="text-sm text-ink-faint -mt-1">Hi Laura, here's where you stand</p>

      <AvailableCard
        weeklyAvailable={budget.weeklyAvailable}
        status={hasAnyData ? budget.status : "calm"}
        horizonWeeks={budget.horizonWeeks}
        empty={!hasAnyData}
      />

      {!hasAnyData && (
        <Card className="text-center">
          <p className="text-sm text-ink-soft">
            Log your first income or expense with the{" "}
            <span className="font-semibold text-primary-dark">+</span> button
            below to see your weekly number update.
          </p>
        </Card>
      )}

      <Card>
        <SectionTitle>Upcoming fixed expenses</SectionTitle>
        <FixedExpenseList reservations={budget.reservations} />
      </Card>

      <Card>
        <SectionTitle>Spending by category · last 7 days</SectionTitle>
        <CategoryBreakdown items={breakdown.items} total={breakdown.total} />
      </Card>
    </div>
  );
}
