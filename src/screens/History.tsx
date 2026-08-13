import { useMemo, useState } from "react";
import clsx from "clsx";
import { Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { CATEGORIES, CATEGORY_LABELS, type Category, type Entry } from "../types";
import { Header } from "../components/Header";

type TypeFilter = "all" | "income" | "variable" | "fixed";

export function History() {
  const { state, dispatch } = useApp();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const allEntries: Entry[] = useMemo(
    () => [...state.income, ...state.variableExpenses, ...state.fixedExpenses],
    [state]
  );

  const entryDate = (e: Entry) => (e.type === "fixed" ? e.dueDate : e.date);

  const filtered = allEntries
    .filter((e) => typeFilter === "all" || e.type === typeFilter)
    .filter((e) => categoryFilter === "all" || (e.type === "variable" && e.category === categoryFilter))
    .filter((e) => !from || entryDate(e) >= from)
    .filter((e) => !to || entryDate(e) <= to)
    .sort((a, b) => entryDate(b).localeCompare(entryDate(a)));

  const handleDelete = (entry: Entry) => {
    dispatch({ type: "DELETE_ENTRY", payload: { id: entry.id, entryType: entry.type } });
  };

  return (
    <div className="flex-1 pb-24">
      <Header title="History" />
      <div className="px-5">
        <div className="flex gap-2 overflow-x-auto pb-1 mb-3 -mx-1 px-1">
          {(
            [
              ["all", "All"],
              ["income", "Income"],
              ["variable", "Spent"],
              ["fixed", "Fixed"],
            ] as [TypeFilter, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className={clsx(
                "px-3.5 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap shrink-0",
                typeFilter === value
                  ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary-strong)]"
                  : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-ink-soft)]"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {typeFilter !== "income" && typeFilter !== "fixed" && (
          <div className="flex gap-2 overflow-x-auto pb-1 mb-3 -mx-1 px-1">
            <button
              onClick={() => setCategoryFilter("all")}
              className={clsx(
                "px-3.5 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap shrink-0",
                categoryFilter === "all"
                  ? "bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-ink)]"
                  : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-ink-soft)]"
              )}
            >
              All categories
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={clsx(
                  "px-3.5 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap shrink-0",
                  categoryFilter === cat
                    ? "bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-ink)]"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-ink-soft)]"
                )}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-ink)]"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-ink)]"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="bg-[var(--color-surface-muted)] rounded-2xl px-4 py-8 text-sm text-[var(--color-ink-faint)] text-center">
            No entries match these filters.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((entry) => (
              <HistoryRow key={entry.id} entry={entry} onDelete={() => handleDelete(entry)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryRow({ entry, onDelete }: { entry: Entry; onDelete: () => void }) {
  const isIncome = entry.type === "income";
  const label =
    entry.type === "income"
      ? entry.source || "Income"
      : entry.type === "variable"
        ? entry.note || CATEGORY_LABELS[entry.category]
        : entry.name;
  const date = entry.type === "fixed" ? entry.dueDate : entry.date;
  const sub =
    entry.type === "variable"
      ? CATEGORY_LABELS[entry.category]
      : entry.type === "fixed"
        ? entry.paid
          ? "Paid"
          : "Due"
        : undefined;

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] px-4 py-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--color-ink)] truncate">{label}</p>
        <p className="text-xs text-[var(--color-ink-faint)] mt-0.5">
          {date}
          {sub ? ` · ${sub}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <p
          className={clsx(
            "text-sm font-semibold",
            isIncome ? "text-[var(--color-primary)]" : "text-[var(--color-ink)]"
          )}
        >
          {isIncome ? "+" : "-"}${entry.amount.toFixed(2)}
        </p>
        <button onClick={onDelete} className="text-[var(--color-ink-faint)]" aria-label="Delete entry">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
