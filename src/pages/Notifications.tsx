import { useMemo } from "react";
import clsx from "clsx";
import { useBudgetStore } from "../store/useBudgetStore";
import {
  computeBudgetSnapshot,
  generateApproachingAlerts,
  generateWeeklySummary,
} from "../lib/budgetEngine";
import { formatCurrency, formatDate } from "../lib/format";
import { CATEGORY_LABELS } from "../types";

export function Notifications() {
  const { incomes, variableExpenses, fixedExpenses } = useBudgetStore();
  const today = useMemo(() => new Date(), []);

  const snapshot = useMemo(
    () => computeBudgetSnapshot(incomes, variableExpenses, fixedExpenses, today),
    [incomes, variableExpenses, fixedExpenses, today],
  );

  const weeklySummary = useMemo(
    () => generateWeeklySummary(variableExpenses, snapshot.weeklyAvailable, today),
    [variableExpenses, snapshot.weeklyAvailable, today],
  );

  const approachingAlerts = useMemo(
    () => generateApproachingAlerts(snapshot.reservationResult.reservations, today),
    [snapshot.reservationResult.reservations, today],
  );

  const hasWeeklyData = weeklySummary.totalSpent > 0;

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-lg font-semibold text-sage-900">Notifications</h1>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-sage-400">
          Weekly recap
        </h2>
        {hasWeeklyData ? (
          <div className="rounded-3xl border border-teal-200 bg-teal-50 p-5">
            <p className="text-xs font-medium text-teal-700">
              {formatDate(weeklySummary.weekStart)} – {formatDate(weeklySummary.weekEnd)}
            </p>
            <p className="mt-1 text-lg font-semibold text-teal-800">
              You spent {formatCurrency(weeklySummary.totalSpent)} last week
            </p>
            <ul className="mt-3 space-y-1">
              {weeklySummary.byCategory
                .filter((c) => c.total > 0)
                .map((c) => (
                  <li key={c.category} className="flex justify-between text-sm text-teal-700">
                    <span>{CATEGORY_LABELS[c.category]}</span>
                    <span>
                      {formatCurrency(c.total)} · {Math.round(c.percent)}%
                    </span>
                  </li>
                ))}
            </ul>
            <div className="mt-4 rounded-2xl bg-white/70 px-4 py-3">
              <p className="text-xs text-teal-600">Your available amount for this week</p>
              <p className="text-xl font-bold text-teal-800">
                {formatCurrency(Math.max(0, weeklySummary.newWeeklyAvailable))}
              </p>
            </div>
          </div>
        ) : (
          <EmptyCard text="No spending logged for last week yet — your recap will show up here." />
        )}
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-sage-400">
          Fixed expenses approaching
        </h2>
        {approachingAlerts.length === 0 ? (
          <EmptyCard text="Nothing due in the next 30 days." />
        ) : (
          <ul className="flex flex-col gap-3">
            {approachingAlerts.map((a) => {
              const covered = a.stillNeeded <= 0;
              return (
                <li
                  key={a.expense.id}
                  className={clsx(
                    "rounded-3xl border p-5",
                    covered ? "border-sage-200 bg-white" : "border-amber-glow-300 bg-amber-glow-50",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-sage-800">{a.expense.name}</p>
                    <span className="text-xs text-sage-400">
                      {a.daysUntilDue <= 0 ? "Due today" : `In ${a.daysUntilDue}d`}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-sage-500">
                    Due {formatDate(a.expense.dueDate)} · {formatCurrency(a.expense.amount)} total
                  </p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-sage-600">
                      {formatCurrency(a.reserved)} reserved
                    </span>
                    {covered ? (
                      <span className="font-medium text-sage-500">Fully covered</span>
                    ) : (
                      <span className="font-medium text-amber-glow-700">
                        {formatCurrency(a.stillNeeded)} still needed
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-sage-300 bg-white px-5 py-6 text-center text-sm text-sage-400">
      {text}
    </div>
  );
}
