"use client";

import Link from "next/link";
import { Plus, Wallet } from "lucide-react";
import { useBudgetStore } from "@/lib/store";
import { computeBudgetSummary } from "@/lib/budget";
import { AvailableThisWeek } from "@/components/AvailableThisWeek";
import { UpcomingFixedExpenses } from "@/components/UpcomingFixedExpenses";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";

export default function HomePage() {
  const hasHydrated = useBudgetStore((s) => s.hasHydrated);
  const incomes = useBudgetStore((s) => s.incomes);
  const expenses = useBudgetStore((s) => s.expenses);

  if (!hasHydrated) {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="h-40 w-40 animate-pulse rounded-full bg-surface-muted" />
      </main>
    );
  }

  const summary = computeBudgetSummary(incomes, expenses);

  if (incomes.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Wallet size={28} />
        </div>
        <h1 className="text-xl font-semibold">Welcome to Flexi Budget</h1>
        <p className="text-sm text-foreground-muted">
          Log your first bit of income to see how much you can safely spend this week.
        </p>
        <Link
          href="/income/add"
          className="mt-2 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-white"
        >
          <Plus size={18} /> Add income
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-foreground-muted">Flexi Budget</p>
          <h1 className="text-lg font-semibold">Your week at a glance</h1>
        </div>
      </header>

      <AvailableThisWeek summary={summary} />

      <div className="flex gap-3">
        <Link
          href="/income/add"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface py-3 text-sm font-medium"
        >
          <Plus size={16} /> Income
        </Link>
        <Link
          href="/expense/add"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface py-3 text-sm font-medium"
        >
          <Plus size={16} /> Expense
        </Link>
      </div>

      <UpcomingFixedExpenses expenses={summary.upcomingFixedExpenses} />

      <CategoryBreakdown data={summary.categoryBreakdown} total={summary.categoryTotal} />
    </main>
  );
}
