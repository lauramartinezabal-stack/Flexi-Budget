import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { useApp } from "../context/AppContext";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "../types";
import { Header } from "../components/Header";
import { toISODate } from "../lib/budget";

type Tab = "income" | "variable" | "fixed";

export function Add() {
  const [params] = useSearchParams();
  const initialTab = (params.get("type") as Tab) || "income";
  const [tab, setTab] = useState<Tab>(
    initialTab === "fixed" || initialTab === "variable" ? initialTab : "income"
  );

  return (
    <div className="flex-1 pb-24">
      <Header title="Add" />
      <div className="px-5">
        <div className="flex bg-[var(--color-surface-muted)] rounded-full p-1 mb-6">
          {(
            [
              ["income", "Income"],
              ["variable", "Spent"],
              ["fixed", "Upcoming"],
            ] as [Tab, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={clsx(
                "flex-1 py-2 rounded-full text-sm font-medium transition-colors",
                tab === value
                  ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm"
                  : "text-[var(--color-ink-faint)]"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "income" && <AddIncomeForm />}
        {tab === "variable" && <AddVariableForm />}
        {tab === "fixed" && <AddFixedForm />}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-[var(--color-ink-soft)] mb-1.5">{children}</label>;
}

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)] transition-colors";

function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="w-full py-3.5 rounded-xl bg-[var(--color-primary)] text-white font-medium mt-2"
    >
      {children}
    </button>
  );
}

function AddIncomeForm() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [date, setDate] = useState(toISODate(new Date()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value <= 0) return;
    dispatch({ type: "ADD_INCOME", payload: { amount: value, source: source.trim() || undefined, date } });
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          autoFocus
          required
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
        <FieldLabel>Date</FieldLabel>
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

function AddVariableForm() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("food");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(toISODate(new Date()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value <= 0) return;
    dispatch({
      type: "ADD_VARIABLE_EXPENSE",
      payload: { amount: value, category, note: note.trim() || undefined, date },
    });
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          autoFocus
          required
        />
      </div>
      <div>
        <FieldLabel>Category</FieldLabel>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setCategory(cat)}
              className={clsx(
                "py-2.5 rounded-xl text-xs font-medium border transition-colors",
                category === cat
                  ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary-strong)]"
                  : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-ink-soft)]"
              )}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Note (optional)</FieldLabel>
        <input
          className={inputClass}
          type="text"
          placeholder="Coffee with friends"
          value={note}
          onChange={(e) => setNote(e.target.value)}
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

function AddFixedForm() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(toISODate(new Date()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value <= 0 || !name.trim()) return;
    dispatch({ type: "ADD_FIXED_EXPENSE", payload: { name: name.trim(), amount: value, dueDate } });
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <FieldLabel>Name</FieldLabel>
        <input
          className={inputClass}
          type="text"
          placeholder="Tuition, rent, subscription…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
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
      <SubmitButton>Add fixed expense</SubmitButton>
      <p className="text-xs text-[var(--color-ink-faint)] text-center px-4">
        We'll automatically reserve money for this as your balance grows.
      </p>
    </form>
  );
}
