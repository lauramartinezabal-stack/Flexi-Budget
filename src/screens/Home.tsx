import { useMemo } from "react";
import { Link } from "react-router-dom";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { useApp } from "../context/AppContext";
import { categoryBreakdown, computeBudgetSummary } from "../lib/budget";
import { CATEGORY_LABELS, type Category } from "../types";
import { Header } from "../components/Header";

const CATEGORY_COLOR: Record<Category, string> = {
  food: "var(--color-food)",
  transport: "var(--color-transport)",
  leisure: "var(--color-leisure)",
  other: "var(--color-other)",
};

export function Home() {
  const { state } = useApp();
  const today = new Date();

  const summary = useMemo(() => computeBudgetSummary(state, today), [state]);

  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const breakdown = useMemo(
    () => categoryBreakdown(state.variableExpenses, weekStart, weekEnd),
    [state.variableExpenses]
  );
  const breakdownTotal = Object.values(breakdown).reduce((a, b) => a + b, 0);

  const upcomingFixed = summary.reservedFixedExpenses
    .slice()
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const isLow = summary.availableThisWeek < 15;

  return (
    <div className="flex-1 pb-24">
      <Header title="Flexi Budget" />

      <section className="px-5">
        <div className="rounded-3xl bg-[var(--color-primary)] text-white px-6 py-8 text-center shadow-sm">
          <p className="text-sm text-white/80 mb-2">Available this week</p>
          <p className="text-5xl font-semibold tracking-tight">
            ${summary.availableThisWeek.toFixed(2)}
          </p>
          {isLow && summary.availableThisWeek > 0 && (
            <p className="text-xs text-white/80 mt-3">
              Tight week — you're close to your reserved minimums.
            </p>
          )}
          {summary.availableThisWeek === 0 && summary.reservedTotal > 0 && (
            <p className="text-xs text-white/80 mt-3">
              Every dollar right now is reserved for upcoming fixed expenses.
            </p>
          )}
          <p className="text-xs text-white/70 mt-3">
            Based on ${summary.spendablePool.toFixed(2)} spendable over {summary.weeksRemaining}{" "}
            week{summary.weeksRemaining === 1 ? "" : "s"} until {format(new Date(summary.horizonDate), "MMM d")}
          </p>
        </div>
      </section>

      <section className="px-5 mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">Upcoming fixed expenses</h2>
          <Link to="/add?type=fixed" className="text-xs text-[var(--color-primary)] font-medium">
            + Add
          </Link>
        </div>
        {upcomingFixed.length === 0 ? (
          <EmptyCard text="No upcoming fixed expenses yet. Add tuition, rent, or subscriptions to keep them reserved automatically." />
        ) : (
          <div className="space-y-2">
            {upcomingFixed.map((expense) => {
              const pct = expense.amount > 0 ? Math.min(100, (expense.reserved / expense.amount) * 100) : 100;
              return (
                <div
                  key={expense.id}
                  className="bg-[var(--color-surface)] rounded-2xl px-4 py-3 border border-[var(--color-border)]"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-[var(--color-ink)]">{expense.name}</p>
                    <p className="text-sm text-[var(--color-ink-soft)]">
                      {format(new Date(expense.dueDate), "MMM d")}
                    </p>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-[var(--color-surface-muted)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--color-primary)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--color-ink-faint)]">
                    ${expense.reserved.toFixed(2)} reserved of ${expense.amount.toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="px-5 mt-8">
        <h2 className="text-sm font-semibold text-[var(--color-ink)] mb-3">
          Spending by category — this week
        </h2>
        {breakdownTotal === 0 ? (
          <EmptyCard text="No spending logged this week yet." />
        ) : (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] px-4 py-4">
            <div className="flex h-3 rounded-full overflow-hidden mb-4">
              {(Object.keys(breakdown) as Category[]).map((cat) =>
                breakdown[cat] > 0 ? (
                  <div
                    key={cat}
                    style={{
                      width: `${(breakdown[cat] / breakdownTotal) * 100}%`,
                      background: CATEGORY_COLOR[cat],
                    }}
                  />
                ) : null
              )}
            </div>
            <div className="space-y-2">
              {(Object.keys(breakdown) as Category[]).map((cat) => (
                <div key={cat} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-[var(--color-ink-soft)]">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: CATEGORY_COLOR[cat] }}
                    />
                    {CATEGORY_LABELS[cat]}
                  </span>
                  <span className="font-medium text-[var(--color-ink)]">
                    ${breakdown[cat].toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="bg-[var(--color-surface-muted)] rounded-2xl px-4 py-5 text-sm text-[var(--color-ink-faint)] text-center">
      {text}
    </div>
  );
}
