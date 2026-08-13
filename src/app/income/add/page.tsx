"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { useBudgetStore } from "@/lib/store";
import { todayIso } from "@/lib/format";

const SOURCE_SUGGESTIONS = ["Scholarship", "Family", "Job", "Freelance", "Other"];

export default function AddIncomePage() {
  const router = useRouter();
  const addIncome = useBudgetStore((s) => s.addIncome);

  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [date, setDate] = useState(todayIso());
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    addIncome({ amount: parsed, source: source || undefined, date });
    router.push("/");
  }

  return (
    <main className="flex flex-1 flex-col gap-6 pb-6">
      <PageHeader title="Add income" />

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

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground-muted">
            Source <span className="font-normal">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Scholarship"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {SOURCE_SUGGESTIONS.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setSource(s)}
                className="rounded-full border border-border px-3 py-1 text-xs text-foreground-muted"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground-muted">Date</label>
          <input
            type="date"
            value={date}
            max={todayIso()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none"
          />
        </div>

        <button
          type="submit"
          className="mt-2 rounded-xl bg-primary py-3.5 text-center font-medium text-white"
        >
          Add income
        </button>
      </form>
    </main>
  );
}
