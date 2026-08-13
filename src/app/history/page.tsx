"use client";

import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CalendarClock, Trash2 } from "lucide-react";
import { useBudgetStore } from "@/lib/store";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/colors";
import { formatCurrency, formatDateLong } from "@/lib/format";

type FilterOption = "all" | "income" | "fixed" | Category;

interface HistoryItem {
  id: string;
  kind: "income" | "variable" | "fixed";
  amount: number;
  date: string;
  label: string;
  category?: Category;
}

export default function HistoryPage() {
  const hasHydrated = useBudgetStore((s) => s.hasHydrated);
  const incomes = useBudgetStore((s) => s.incomes);
  const expenses = useBudgetStore((s) => s.expenses);
  const removeIncome = useBudgetStore((s) => s.removeIncome);
  const removeExpense = useBudgetStore((s) => s.removeExpense);

  const [filter, setFilter] = useState<FilterOption>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const items: HistoryItem[] = useMemo(() => {
    const incomeItems: HistoryItem[] = incomes.map((i) => ({
      id: i.id,
      kind: "income",
      amount: i.amount,
      date: i.date,
      label: i.source || "Income",
    }));
    const expenseItems: HistoryItem[] = expenses.map((e) =>
      e.kind === "variable"
        ? {
            id: e.id,
            kind: "variable",
            amount: e.amount,
            date: e.date,
            label: e.name || CATEGORY_LABELS[e.category],
            category: e.category,
          }
        : {
            id: e.id,
            kind: "fixed",
            amount: e.amount,
            date: e.dueDate,
            label: e.name,
          }
    );
    return [...incomeItems, ...expenseItems].sort((a, b) => b.date.localeCompare(a.date));
  }, [incomes, expenses]);

  const filtered = items.filter((item) => {
    if (filter === "income" && item.kind !== "income") return false;
    if (filter === "fixed" && item.kind !== "fixed") return false;
    if (CATEGORIES.includes(filter as Category) && item.category !== filter) return false;
    if (from && item.date < from) return false;
    if (to && item.date > to) return false;
    return true;
  });

  function handleDelete(item: HistoryItem) {
    if (item.kind === "income") removeIncome(item.id);
    else removeExpense(item.id);
  }

  if (!hasHydrated) return null;

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 pt-6">
      <h1 className="text-lg font-semibold">History</h1>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(
            [
              { value: "all", label: "All" },
              { value: "income", label: "Income" },
              { value: "fixed", label: "Fixed" },
              ...CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
            ] as { value: FilterOption; label: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                filter === opt.value
                  ? "border-primary bg-primary-soft text-primary-strong"
                  : "border-border bg-surface text-foreground-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none"
            aria-label="From date"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none"
            aria-label="To date"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-foreground-muted">
          Nothing matches these filters yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2 pb-4">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor:
                    item.kind === "income"
                      ? "var(--primary-soft)"
                      : item.kind === "fixed"
                        ? "var(--warn-soft)"
                        : "var(--accent-soft)",
                  color:
                    item.kind === "income"
                      ? "var(--primary)"
                      : item.kind === "fixed"
                        ? "var(--warn)"
                        : item.category
                          ? CATEGORY_COLORS[item.category]
                          : "var(--accent)",
                }}
              >
                {item.kind === "income" ? (
                  <ArrowUpRight size={18} />
                ) : item.kind === "fixed" ? (
                  <CalendarClock size={18} />
                ) : (
                  <ArrowDownLeft size={18} />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-foreground-muted">
                  {formatDateLong(item.date)}
                  {item.kind === "fixed" ? " (due date)" : ""}
                </p>
              </div>
              <p
                className={`font-semibold ${item.kind === "income" ? "text-primary-strong" : ""}`}
              >
                {item.kind === "income" ? "+" : "-"}
                {formatCurrency(item.amount)}
              </p>
              <button
                onClick={() => handleDelete(item)}
                aria-label="Delete entry"
                className="p-1 text-foreground-muted"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
