import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useBudgetStore } from "../store/useBudgetStore";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "../types";

type Mode = "income" | "expense";
type ExpenseKind = "variable" | "fixed";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AddEntry() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("income");
  const [expenseKind, setExpenseKind] = useState<ExpenseKind>("variable");

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <h1 className="text-lg font-semibold text-sage-900">Add</h1>

      <div className="grid grid-cols-2 gap-2 rounded-full bg-sage-100 p-1">
        <ToggleButton active={mode === "income"} onClick={() => setMode("income")}>
          Income
        </ToggleButton>
        <ToggleButton active={mode === "expense"} onClick={() => setMode("expense")}>
          Expense
        </ToggleButton>
      </div>

      {mode === "income" ? (
        <IncomeForm onDone={() => navigate("/")} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 rounded-full border border-sage-200 p-1">
            <ToggleButton
              small
              active={expenseKind === "variable"}
              onClick={() => setExpenseKind("variable")}
            >
              Day-to-day
            </ToggleButton>
            <ToggleButton
              small
              active={expenseKind === "fixed"}
              onClick={() => setExpenseKind("fixed")}
            >
              Fixed / upcoming
            </ToggleButton>
          </div>
          {expenseKind === "variable" ? (
            <VariableExpenseForm onDone={() => navigate("/")} />
          ) : (
            <FixedExpenseForm onDone={() => navigate("/")} />
          )}
        </>
      )}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
  small,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-full font-medium transition-colors",
        small ? "py-1.5 text-xs" : "py-2 text-sm",
        active ? "bg-sage-500 text-white shadow-sm" : "text-sage-500",
      )}
    >
      {children}
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-sage-500">{children}</label>;
}

const inputClass =
  "mt-1 w-full rounded-2xl border border-sage-200 bg-white px-4 py-3 text-base text-sage-900 outline-none focus:border-sage-400";

function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="mt-2 w-full rounded-2xl bg-sage-500 py-3 text-sm font-semibold text-white active:scale-[0.99]"
    >
      {children}
    </button>
  );
}

function IncomeForm({ onDone }: { onDone: () => void }) {
  const addIncome = useBudgetStore((s) => s.addIncome);
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [date, setDate] = useState(todayIso());

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    addIncome({ amount: parsed, source: source.trim() || undefined, date });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <FieldLabel>Amount</FieldLabel>
        <input
          className={inputClass}
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          autoFocus
        />
      </div>
      <div>
        <FieldLabel>Source (optional)</FieldLabel>
        <input
          className={inputClass}
          type="text"
          placeholder="Scholarship, family, job…"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
      </div>
      <div>
        <FieldLabel>Date received</FieldLabel>
        <input
          className={inputClass}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <SubmitButton>Add income</SubmitButton>
    </form>
  );
}

function CategoryPicker({
  value,
  onChange,
}: {
  value: Category;
  onChange: (c: Category) => void;
}) {
  return (
    <div>
      <FieldLabel>Category</FieldLabel>
      <div className="mt-1 grid grid-cols-4 gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={clsx(
              "rounded-xl border py-2 text-xs font-medium transition-colors",
              value === cat
                ? "border-sage-500 bg-sage-500 text-white"
                : "border-sage-200 bg-white text-sage-500",
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>
    </div>
  );
}

function VariableExpenseForm({ onDone }: { onDone: () => void }) {
  const addVariableExpense = useBudgetStore((s) => s.addVariableExpense);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayIso());

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    addVariableExpense({ amount: parsed, category, description: description.trim() || undefined, date });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <FieldLabel>Amount</FieldLabel>
        <input
          className={inputClass}
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          autoFocus
        />
      </div>
      <CategoryPicker value={category} onChange={setCategory} />
      <div>
        <FieldLabel>Description (optional)</FieldLabel>
        <input
          className={inputClass}
          type="text"
          placeholder="Groceries, bus fare…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <FieldLabel>Date</FieldLabel>
        <input
          className={inputClass}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <SubmitButton>Log expense</SubmitButton>
    </form>
  );
}

function FixedExpenseForm({ onDone }: { onDone: () => void }) {
  const addFixedExpense = useBudgetStore((s) => s.addFixedExpense);
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("other");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!Number.isFinite(parsed) || parsed <= 0 || !name.trim() || !dueDate) return;
    addFixedExpense({ amount: parsed, name: name.trim(), category, dueDate });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <FieldLabel>Name</FieldLabel>
        <input
          className={inputClass}
          type="text"
          placeholder="Tuition, rent, subscription…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
      </div>
      <div>
        <FieldLabel>Amount</FieldLabel>
        <input
          className={inputClass}
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div>
        <FieldLabel>Due date</FieldLabel>
        <input
          className={inputClass}
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </div>
      <CategoryPicker value={category} onChange={setCategory} />
      <SubmitButton>Add fixed expense</SubmitButton>
    </form>
  );
}
