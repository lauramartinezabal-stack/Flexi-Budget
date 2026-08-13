import { useState } from "react";
import { useBudgetStore } from "../../store/useBudgetStore";
import { FormField, TextInput, AmountInput } from "../ui/FormField";
import { todayIso } from "../../lib/format";

export function AddFixedExpenseForm({ onDone }: { onDone: () => void }) {
  const addFixedExpense = useBudgetStore((s) => s.addFixedExpense);
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [dueDate, setDueDate] = useState("");

  const amountValue = Number(amount);
  const canSubmit = amount !== "" && amountValue > 0 && label.trim() !== "" && dueDate !== "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    addFixedExpense({ amount: amountValue, label: label.trim(), dueDate });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="What is it?">
        <TextInput placeholder="e.g. Tuition, Rent, Netflix" value={label} onChange={(e) => setLabel(e.target.value)} autoFocus />
      </FormField>

      <FormField label="Amount">
        <AmountInput value={amount} onChange={(e) => setAmount(e.target.value)} />
      </FormField>

      <FormField label="Due date">
        <TextInput type="date" value={dueDate} min={todayIso()} onChange={(e) => setDueDate(e.target.value)} />
      </FormField>

      <p className="mb-4 text-[13px] leading-snug" style={{ color: "var(--text-muted)" }}>
        We'll set aside a little from your balance each day between now and the due date, so it's ready when it's due.
      </p>

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-2 w-full rounded-xl py-3.5 text-[15px] font-semibold text-white disabled:opacity-40"
        style={{ background: "var(--brand)" }}
      >
        Add fixed expense
      </button>
    </form>
  );
}
