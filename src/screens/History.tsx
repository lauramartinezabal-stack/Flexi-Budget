import { format, parseISO } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, CalendarClock, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { formatCurrency } from "../lib/format";
import { useBudgetStore } from "../store/budgetStore";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "../types";

type Filter = "all" | "income" | "variable" | "fixed";

const inputClass =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40";

interface Row {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  amount: number;
  positive: boolean;
  kind: "income" | "variable" | "fixed";
}

export function History() {
  const incomes = useBudgetStore((s) => s.incomes);
  const expenses = useBudgetStore((s) => s.expenses);
  const deleteIncome = useBudgetStore((s) => s.deleteIncome);
  const deleteExpense = useBudgetStore((s) => s.deleteExpense);

  const [filter, setFilter] = useState<Filter>("all");
  const [category, setCategory] = useState<ExpenseCategory | "all">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const rows: Row[] = useMemo(() => {
    const incomeRows: Row[] = incomes.map((i) => ({
      id: i.id,
      date: i.date,
      title: i.note || "Income",
      subtitle: i.source
        ? i.source[0].toUpperCase() + i.source.slice(1)
        : "Income",
      amount: i.amount,
      positive: true,
      kind: "income",
    }));

    const expenseRows: Row[] = expenses.map((e) =>
      e.kind === "variable"
        ? {
            id: e.id,
            date: e.date,
            title: e.note || e.category[0].toUpperCase() + e.category.slice(1),
            subtitle: e.category[0].toUpperCase() + e.category.slice(1),
            amount: e.amount,
            positive: false,
            kind: "variable" as const,
          }
        : {
            id: e.id,
            date: e.dueDate,
            title: e.name,
            subtitle: e.paid ? "Fixed · paid" : "Fixed · upcoming",
            amount: e.amount,
            positive: false,
            kind: "fixed" as const,
          },
    );

    return [...incomeRows, ...expenseRows].sort(
      (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime(),
    );
  }, [incomes, expenses]);

  const filtered = rows.filter((r) => {
    if (filter !== "all" && r.kind !== filter) return false;
    if (category !== "all") {
      const original = expenses.find((e) => e.id === r.id);
      if (
        !original ||
        original.kind !== "variable" ||
        original.category !== category
      )
        return false;
    }
    if (from && r.date < from) return false;
    if (to && r.date > to) return false;
    return true;
  });

  const handleDelete = (row: Row) => {
    if (row.kind === "income") deleteIncome(row.id);
    else deleteExpense(row.id);
  };

  return (
    <div className="flex flex-col gap-5 px-5 pb-6">
      <PageHeader title="History" />

      <div className="flex flex-wrap gap-2">
        {(
          [
            { value: "all", label: "All" },
            { value: "income", label: "Income" },
            { value: "variable", label: "Spent" },
            { value: "fixed", label: "Fixed" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors ${
              filter === opt.value
                ? "bg-primary text-white border-primary"
                : "bg-surface text-ink-soft border-border"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as ExpenseCategory | "all")
          }
          className={inputClass}
        >
          <option value="all">All categories</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className={inputClass}
          aria-label="From date"
        />
        <span className="text-ink-faint text-sm">–</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className={inputClass}
          aria-label="To date"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-ink-soft">No entries match these filters.</p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((r) => (
            <li key={`${r.kind}-${r.id}`}>
              <Card className="flex items-center gap-3 py-3.5">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    r.positive
                      ? "bg-primary-soft text-primary-dark"
                      : r.kind === "fixed"
                        ? "bg-surface-muted text-ink-soft"
                        : "bg-surface-muted text-ink-soft"
                  }`}
                >
                  {r.positive ? (
                    <ArrowDownLeft size={17} />
                  ) : r.kind === "fixed" ? (
                    <CalendarClock size={17} />
                  ) : (
                    <ArrowUpRight size={17} />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">
                    {r.title}
                  </p>
                  <p className="text-xs text-ink-faint">
                    {r.subtitle} · {format(parseISO(r.date), "MMM d, yyyy")}
                  </p>
                </div>
                <p
                  className={`text-sm font-semibold shrink-0 ${
                    r.positive ? "text-primary-dark" : "text-ink"
                  }`}
                >
                  {r.positive ? "+" : "−"}
                  {formatCurrency(r.amount)}
                </p>
                <button
                  type="button"
                  onClick={() => handleDelete(r)}
                  aria-label="Delete entry"
                  className="text-ink-faint p-1 shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
