import { useMemo, useState } from "react";
import { subDays, subMonths } from "date-fns";
import { useBudgetStore } from "../store/useBudgetStore";
import type { Category, Expense, FixedExpense, IncomeEntry } from "../types";
import { CATEGORIES, CATEGORY_LABELS } from "../types";
import { formatMoney, formatDate } from "../lib/format";
import { Card } from "../components/ui/Card";
import { ArrowDownIcon, ArrowUpIcon, CalendarIcon, CheckIcon } from "../components/ui/Icons";

type FilterKey = "all" | "income" | "fixed" | Category;
type RangeKey = "all" | "7" | "30";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "income", label: "Income" },
  { key: "fixed", label: "Fixed" },
  ...CATEGORIES.map((c) => ({ key: c as FilterKey, label: CATEGORY_LABELS[c] })),
];

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "all", label: "All time" },
];

type Row =
  | { type: "income"; date: string; data: IncomeEntry }
  | { type: "expense"; date: string; data: Expense };

const CATEGORY_COLOR: Record<Category, string> = {
  food: "var(--series-food)",
  transport: "var(--series-transport)",
  leisure: "var(--series-leisure)",
  other: "var(--series-other)",
};

function RowIcon({ row }: { row: Row }) {
  if (row.type === "income") {
    return (
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ background: "var(--brand-soft)", color: "var(--brand-strong)" }}
      >
        <ArrowUpIcon size={16} />
      </span>
    );
  }
  const expense = row.data as Expense;
  if (expense.kind === "fixed") {
    return (
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ background: "var(--surface-sunken)", color: "var(--text-secondary)" }}
      >
        <CalendarIcon size={16} />
      </span>
    );
  }
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      style={{ background: "var(--surface-sunken)", color: CATEGORY_COLOR[expense.category] }}
    >
      <ArrowDownIcon size={16} />
    </span>
  );
}

function RowTitle({ row }: { row: Row }) {
  if (row.type === "income") {
    const income = row.data as IncomeEntry;
    return <>{income.source || "Income"}</>;
  }
  const expense = row.data as Expense;
  if (expense.kind === "fixed") return <>{expense.label}</>;
  return <>{expense.note || CATEGORY_LABELS[expense.category]}</>;
}

function RowSubtitle({ row }: { row: Row }) {
  if (row.type === "income") return <>Income · {formatDate(row.date)}</>;
  const expense = row.data as Expense;
  if (expense.kind === "fixed") {
    return (
      <>
        Fixed expense · due {formatDate(expense.dueDate)} {expense.paid && "· paid"}
      </>
    );
  }
  return (
    <>
      {CATEGORY_LABELS[expense.category]} · {formatDate(row.date)}
    </>
  );
}

export function History() {
  const incomes = useBudgetStore((s) => s.incomes);
  const expenses = useBudgetStore((s) => s.expenses);
  const markFixedExpensePaid = useBudgetStore((s) => s.markFixedExpensePaid);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [range, setRange] = useState<RangeKey>("30");

  const rows = useMemo<Row[]>(() => {
    const incomeRows: Row[] = incomes.map((i) => ({ type: "income", date: i.date, data: i }));
    const expenseRows: Row[] = expenses.map((e) => ({
      type: "expense",
      date: e.kind === "fixed" ? e.dueDate : e.date,
      data: e,
    }));
    return [...incomeRows, ...expenseRows].sort((a, b) => b.date.localeCompare(a.date));
  }, [incomes, expenses]);

  const filtered = useMemo(() => {
    const cutoff = range === "all" ? null : range === "7" ? subDays(new Date(), 7) : subMonths(new Date(), 1);
    return rows.filter((row) => {
      if (cutoff && new Date(row.date) < cutoff) return false;
      if (filter === "all") return true;
      if (filter === "income") return row.type === "income";
      if (filter === "fixed") return row.type === "expense" && (row.data as Expense).kind === "fixed";
      if (row.type !== "expense") return false;
      const expense = row.data as Expense;
      return expense.kind === "variable" && expense.category === filter;
    });
  }, [rows, filter, range]);

  return (
    <div>
      <h1 className="mb-5 text-xl font-bold" style={{ color: "var(--text-primary)" }}>
        History
      </h1>

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold"
            style={{
              background: range === r.key ? "var(--brand)" : "var(--surface-sunken)",
              color: range === r.key ? "white" : "var(--text-secondary)",
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold"
            style={{
              background: filter === f.key ? "var(--text-primary)" : "var(--surface-sunken)",
              color: filter === f.key ? "var(--surface-card)" : "var(--text-secondary)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
            Nothing here yet for this filter.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((row) => {
            const amount = row.data.amount;
            const isIncome = row.type === "income";
            const isFixed = row.type === "expense" && (row.data as Expense).kind === "fixed";
            const fixedData = isFixed ? (row.data as FixedExpense) : null;
            return (
              <Card key={row.data.id} className="flex items-center gap-3 p-3.5">
                <RowIcon row={row} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
                    <RowTitle row={row} />
                  </p>
                  <p className="truncate text-[12px]" style={{ color: "var(--text-muted)" }}>
                    <RowSubtitle row={row} />
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <p
                    className="text-[14px] font-semibold tabular-nums"
                    style={{ color: isIncome ? "var(--brand-strong)" : "var(--text-primary)" }}
                  >
                    {isIncome ? "+" : "-"}
                    {formatMoney(amount)}
                  </p>
                  {fixedData && (
                    <button
                      onClick={() => markFixedExpensePaid(fixedData.id, !fixedData.paid)}
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        background: fixedData.paid ? "var(--status-good-soft)" : "var(--surface-sunken)",
                        color: fixedData.paid ? "var(--status-good)" : "var(--text-muted)",
                      }}
                    >
                      <CheckIcon size={11} />
                      {fixedData.paid ? "Paid" : "Mark paid"}
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
