import { useMemo, useState } from "react";
import clsx from "clsx";
import { useBudgetStore } from "../store/useBudgetStore";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "../types";
import { formatCurrency, formatDateWithYear } from "../lib/format";

type TypeFilter = "all" | "income" | "expense";
type CategoryFilter = "all" | Category;

interface Row {
  id: string;
  kind: "income" | "variable" | "fixed";
  label: string;
  sublabel: string;
  amount: number;
  signed: number;
  date: string;
  category?: Category;
  paid?: boolean;
}

export function History() {
  const { incomes, variableExpenses, fixedExpenses, markFixedExpensePaid } = useBudgetStore();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const rows = useMemo<Row[]>(() => {
    const incomeRows: Row[] = incomes.map((i) => ({
      id: i.id,
      kind: "income",
      label: i.source || "Income",
      sublabel: "Income",
      amount: i.amount,
      signed: i.amount,
      date: i.date,
    }));
    const variableRows: Row[] = variableExpenses.map((e) => ({
      id: e.id,
      kind: "variable",
      label: e.description || CATEGORY_LABELS[e.category],
      sublabel: CATEGORY_LABELS[e.category],
      amount: e.amount,
      signed: -e.amount,
      date: e.date,
      category: e.category,
    }));
    const fixedRows: Row[] = fixedExpenses.map((e) => ({
      id: e.id,
      kind: "fixed",
      label: e.name,
      sublabel: `Fixed · due ${formatDateWithYear(e.dueDate)}`,
      amount: e.amount,
      signed: -e.amount,
      date: e.paid ? e.paidDate ?? e.dueDate : e.dueDate,
      category: e.category,
      paid: e.paid,
    }));

    return [...incomeRows, ...variableRows, ...fixedRows].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [incomes, variableExpenses, fixedExpenses]);

  const filtered = rows.filter((r) => {
    if (typeFilter === "income" && r.kind !== "income") return false;
    if (typeFilter === "expense" && r.kind === "income") return false;
    if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
    if (from && r.date < from) return false;
    if (to && r.date > to) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-lg font-semibold text-sage-900">History</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "income", "expense"] as TypeFilter[]).map((t) => (
          <FilterChip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
            {t === "all" ? "All" : t === "income" ? "Income" : "Expenses"}
          </FilterChip>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")}>
          All categories
        </FilterChip>
        {CATEGORIES.map((c) => (
          <FilterChip key={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)}>
            {CATEGORY_LABELS[c]}
          </FilterChip>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-sage-500">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 w-full rounded-xl border border-sage-200 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-sage-500">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 w-full rounded-xl border border-sage-200 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-sage-400">No transactions match these filters.</p>
      ) : (
        <ul className="divide-y divide-sage-100 rounded-3xl border border-sage-200/70 bg-white">
          {filtered.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-sage-800">{r.label}</p>
                <p className="text-xs text-sage-400">
                  {r.sublabel} · {formatDateWithYear(r.date)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={clsx(
                    "text-sm font-semibold",
                    r.kind === "income" ? "text-teal-600" : "text-sage-700",
                  )}
                >
                  {r.kind === "income" ? "+" : "-"}
                  {formatCurrency(r.amount)}
                </span>
                {r.kind === "fixed" && (
                  <button
                    onClick={() => markFixedExpensePaid(r.id, !r.paid)}
                    className={clsx(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium",
                      r.paid ? "bg-sage-100 text-sage-600" : "border border-sage-200 text-sage-400",
                    )}
                  >
                    {r.paid ? "Paid" : "Mark paid"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "bg-sage-500 text-white" : "border border-sage-200 text-sage-500",
      )}
    >
      {children}
    </button>
  );
}
