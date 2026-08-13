import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useBudgetStore } from "../store/budgetStore";
import { INCOME_SOURCES, type IncomeSource } from "../types";

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/40";
const labelClass = "text-sm font-medium text-ink-soft mb-1.5 block";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AddIncome() {
  const navigate = useNavigate();
  const addIncome = useBudgetStore((s) => s.addIncome);

  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<IncomeSource | "">("");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = Number(amount);
    if (!amount || Number.isNaN(parsed) || parsed <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    addIncome({
      amount: parsed,
      source: source || undefined,
      date,
      note: note.trim() || undefined,
    });
    navigate("/");
  };

  return (
    <div className="flex flex-col gap-5 px-5 pb-6">
      <PageHeader title="Log income" showBack />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className={labelClass} htmlFor="amount">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint text-base">
              €
            </span>
            <input
              id="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`${inputClass} pl-8`}
              autoFocus
            />
          </div>
          {error && <p className="text-critical text-xs mt-1.5">{error}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="source">
            Source (optional)
          </label>
          <select
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value as IncomeSource)}
            className={inputClass}
          >
            <option value="">Not specified</option>
            {INCOME_SOURCES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="date">
            Date received
          </label>
          <input
            id="date"
            type="date"
            value={date}
            max={today()}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="note">
            Note (optional)
          </label>
          <input
            id="note"
            type="text"
            placeholder="e.g. August stipend"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={inputClass}
            maxLength={80}
          />
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-primary text-white text-base font-semibold py-3.5 active:scale-[0.98] transition-transform"
        >
          Save income
        </button>
      </form>
    </div>
  );
}
