import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useBudgetStore } from "../store/budgetStore";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "../types";

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/40";
const labelClass = "text-sm font-medium text-ink-soft mb-1.5 block";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

type ExpenseType = "variable" | "fixed";

export function AddExpense() {
  const navigate = useNavigate();
  const addVariableExpense = useBudgetStore((s) => s.addVariableExpense);
  const addFixedExpense = useBudgetStore((s) => s.addFixedExpense);

  const [type, setType] = useState<ExpenseType>("variable");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState(today());
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = Number(amount);
    if (!amount || Number.isNaN(parsed) || parsed <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }

    if (type === "variable") {
      addVariableExpense({
        amount: parsed,
        category,
        date,
        note: note.trim() || undefined,
      });
    } else {
      if (!name.trim()) {
        setError("Give this expense a name.");
        return;
      }
      addFixedExpense({ amount: parsed, name: name.trim(), dueDate });
    }
    navigate("/");
  };

  return (
    <div className="flex flex-col gap-5 px-5 pb-6">
      <PageHeader title="Log expense" showBack />

      <div className="flex rounded-xl bg-surface-muted p-1">
        {(
          [
            { value: "variable", label: "Spent already" },
            { value: "fixed", label: "Upcoming / fixed" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              setType(opt.value);
              setError("");
            }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
              type === opt.value
                ? "bg-surface text-ink shadow-sm"
                : "text-ink-faint"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

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
        </div>

        {type === "variable" ? (
          <>
            <div>
              <label className={labelClass} htmlFor="category">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as ExpenseCategory)
                }
                className={inputClass}
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="date">
                Date
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
                placeholder="e.g. Groceries"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={inputClass}
                maxLength={80}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className={labelClass} htmlFor="name">
                What is it?
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Tuition, rent, Spotify"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                maxLength={60}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="dueDate">
                Due date
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                min={today()}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <p className="text-xs text-ink-faint -mt-1">
              We'll automatically set money aside for this as your income
              comes in, so it doesn't eat into next week's spending.
            </p>
          </>
        )}

        {error && <p className="text-critical text-xs -mt-2">{error}</p>}

        <button
          type="submit"
          className="mt-1 w-full rounded-xl bg-primary text-white text-base font-semibold py-3.5 active:scale-[0.98] transition-transform"
        >
          Save expense
        </button>
      </form>
    </div>
  );
}
