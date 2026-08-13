import { useState } from "react";
import { useBudgetStore } from "../../store/useBudgetStore";
import { FormField, TextInput, AmountInput } from "../ui/FormField";
import { todayIso } from "../../lib/format";

const SOURCE_SUGGESTIONS = ["Scholarship", "Family", "Job", "Freelance", "Other"];

export function AddIncomeForm({ onDone }: { onDone: () => void }) {
  const addIncome = useBudgetStore((s) => s.addIncome);
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [date, setDate] = useState(todayIso());

  const amountValue = Number(amount);
  const canSubmit = amount !== "" && amountValue > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    addIncome({ amount: amountValue, source: source.trim() || undefined, date });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Amount">
        <AmountInput value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
      </FormField>

      <FormField label="Source (optional)">
        <TextInput
          placeholder="e.g. Scholarship"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          list="income-sources"
        />
        <datalist id="income-sources">
          {SOURCE_SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </FormField>

      <FormField label="Date">
        <TextInput type="date" value={date} max={todayIso()} onChange={(e) => setDate(e.target.value)} />
      </FormField>

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-2 w-full rounded-xl py-3.5 text-[15px] font-semibold text-white disabled:opacity-40"
        style={{ background: "var(--brand)" }}
      >
        Add income
      </button>
    </form>
  );
}
