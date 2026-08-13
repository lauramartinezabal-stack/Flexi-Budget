"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { useBudgetStore } from "@/lib/store";
import { todayIso } from "@/lib/format";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/types";

type ExpenseKind = "variable" | "fixed";

export default function AddExpensePage() {
  const router = useRouter();
  const addVariableExpense = useBudgetStore((s) => s.addVariableExpense);
  const addFixedExpense = useBudgetStore((s) => s.addFixedExpense);

  const [kind, setKind] = useState<ExpenseKind>("variable");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("food");
  const [date, setDate] = useState(todayIso());
  const [dueDate, setDueDate] = useState(todayIso());
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }

    if (kind === "variable") {
      addVariableExpense({ amount: parsed, category, name: name || undefined, date });
    } else {
      if (!name.trim()) {
        setError("Give this expense a name.");
        return;
      }
      addFixedExpense({ amount: parsed, name, dueDate });
    }
    router.push("/");
  }

  return (
    <main className="flex flex-1 flex-col gap-6 pb-6">
      <PageHeader title="Add expense" />

      <div className="px-4">
        <div className="flex rounded-xl border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setKind("variable")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              kind === "variable" ? "bg-primary text-white" : "text-foreground-muted"
            }`}
          >
            Variable
          </button>
          <button
            type="button"
            onClick={() => setKind("fixed")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              kind === "fixed" ? "bg-primary text-white" : "text-foreground-muted"
            }`}
          >
            Fixed / upcoming
          </button>
        </div>
        <p className="mt-2 text-xs text-foreground-muted">
          {kind === "variable"
            ? "Day-to-day spending, logged as it happens."
            : "A known amount due on a future date — we'll reserve for it automatically."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground-muted">
            Amount
          </label>
          <div className="flex items-center rounded-xl border border-border bg-surface px-4 py-3">
            <span className="mr-1 text-foreground-muted">$</span>
            <input
              autoFocus
              inputMode="decimal"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent text-2xl font-semibold outline-none"
            />
          </div>
          {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
        </div>

        {kind === "variable" ? (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground-muted">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                      category === c
                        ? "border-primary bg-primary-soft text-primary-strong"
                        : "border-border bg-surface text-foreground-muted"
                    }`}
                  >
                    {CATEGORY_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground-muted">
                Note <span className="font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Coffee with friends"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground-muted">
                Date
              </label>
              <input
                type="date"
                value={date}
                max={todayIso()}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground-muted">
                Name
              </label>
              <input
                type="text"
                placeholder="e.g. Tuition, Rent, Spring trip"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground-muted">
                Due date
              </label>
              <input
                type="date"
                value={dueDate}
                min={todayIso()}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="mt-2 rounded-xl bg-primary py-3.5 text-center font-medium text-white"
        >
          Add expense
        </button>
      </form>
    </main>
  );
}
