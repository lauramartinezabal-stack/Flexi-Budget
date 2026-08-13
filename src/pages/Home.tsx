import { useMemo } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { useBudgetStore } from "../store/useBudgetStore";
import {
  APPROACHING_THRESHOLD_DAYS,
  computeBudgetSnapshot,
  computeCategoryBreakdown,
} from "../lib/budgetEngine";
import { formatCurrency, formatDate } from "../lib/format";
import { CategoryDonut } from "../components/CategoryDonut";

const LOW_THRESHOLD = 20;

export function Home() {
  const { incomes, variableExpenses, fixedExpenses } = useBudgetStore();

  const today = useMemo(() => new Date(), []);
  const snapshot = useMemo(
    () => computeBudgetSnapshot(incomes, variableExpenses, fixedExpenses, today),
    [incomes, variableExpenses, fixedExpenses, today],
  );

  const recentBreakdown = useMemo(() => {
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    return computeCategoryBreakdown(variableExpenses, { from, to: today });
  }, [variableExpenses, today]);

  const { weeklyAvailable, horizonWeeks, reservationResult, unpaidSorted } = snapshot;
  const nearestBill = unpaidSorted[0];

  const mood: "calm" | "caution" | "tight" =
    weeklyAvailable <= 0 ? "tight" : weeklyAvailable < LOW_THRESHOLD ? "caution" : "calm";

  const moodStyles = {
    calm: "bg-sage-500 text-white",
    caution: "bg-amber-glow-300 text-amber-glow-700",
    tight: "bg-coral-100 text-coral-700",
  }[mood];

  const isEmpty = incomes.length === 0 && variableExpenses.length === 0 && fixedExpenses.length === 0;

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-sage-400">Flexi Budget</p>
          <h1 className="text-lg font-semibold text-sage-900">Hi there</h1>
        </div>
        <Link
          to="/history"
          className="rounded-full border border-sage-200 px-3 py-1.5 text-xs font-medium text-sage-600"
        >
          History
        </Link>
      </header>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <section className={clsx("rounded-3xl p-6 shadow-sm", moodStyles)}>
            <p className="text-sm font-medium opacity-80">Available this week</p>
            <p className="mt-1 text-4xl font-bold tracking-tight">
              {formatCurrency(Math.max(0, weeklyAvailable))}
            </p>
            <p className="mt-2 text-xs opacity-80">
              {nearestBill
                ? `Spread over ${horizonWeeks} week${horizonWeeks > 1 ? "s" : ""} until ${nearestBill.name} is due (${formatDate(nearestBill.dueDate)})`
                : `Spread over the next ${horizonWeeks} weeks as a buffer`}
            </p>
            {reservationResult.totalShortfall > 0 && (
              <p className="mt-3 rounded-xl bg-white/20 px-3 py-2 text-xs font-medium">
                Heads up: current balance is {formatCurrency(reservationResult.totalShortfall)} short
                of covering all upcoming fixed expenses.
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-sage-200/70 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-sage-800">Upcoming fixed expenses</h2>
              <Link to="/add" className="text-xs font-medium text-teal-600">
                + Add
              </Link>
            </div>
            {unpaidSorted.length === 0 ? (
              <p className="text-sm text-sage-400">No upcoming fixed expenses. Nice and clear.</p>
            ) : (
              <ul className="space-y-3">
                {unpaidSorted.map((exp) => {
                  const reservation = reservationResult.reservations.find(
                    (r) => r.expense.id === exp.id,
                  )!;
                  const pct = Math.min(100, Math.round((reservation.reserved / exp.amount) * 100));
                  const daysUntil = Math.round(
                    (new Date(exp.dueDate).getTime() - today.getTime()) / 86400000,
                  );
                  const soon = daysUntil <= APPROACHING_THRESHOLD_DAYS;
                  return (
                    <li key={exp.id}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-sage-800">{exp.name}</span>
                        <span className="text-sage-500">{formatCurrency(exp.amount)}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs text-sage-400">
                        <span>Due {formatDate(exp.dueDate)}</span>
                        <span>
                          {formatCurrency(reservation.reserved)} reserved
                          {soon && daysUntil >= 0 ? ` · ${daysUntil}d` : ""}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-sage-100">
                        <div
                          className={clsx(
                            "h-full rounded-full",
                            pct >= 100 ? "bg-sage-500" : "bg-teal-400",
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="rounded-3xl border border-sage-200/70 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-sage-800">Spending by category</h2>
              <span className="text-xs text-sage-400">Last 7 days</span>
            </div>
            <CategoryDonut data={recentBreakdown} />
          </section>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <section className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-sage-300 bg-white px-6 py-10 text-center">
      <p className="text-base font-semibold text-sage-800">Let's set up your budget</p>
      <p className="text-sm text-sage-500">
        Log your first bit of income or an upcoming bill and Flexi Budget will work out how much you
        can safely spend this week.
      </p>
      <Link
        to="/add"
        className="mt-2 rounded-full bg-sage-500 px-5 py-2 text-sm font-medium text-white"
      >
        Add income or expense
      </Link>
      <LoadSampleDataButton />
    </section>
  );
}

function LoadSampleDataButton() {
  const loadSampleData = useBudgetStore((s) => s.loadSampleData);
  return (
    <button
      onClick={loadSampleData}
      className="text-xs font-medium text-teal-600 underline underline-offset-2"
    >
      Or try it with sample data
    </button>
  );
}
