import { useState } from "react";
import { useBudgetStore } from "../../store/useBudgetStore";
import { FormField, TextInput, AmountInput } from "../ui/FormField";
import { todayIso } from "../../lib/format";
import type { Category } from "../../types";
import { CATEGORIES, CATEGORY_LABELS } from "../../types";

const CATEGORY_COLOR: Record<Category, string> = {
  food: "var(--series-food)",
  transport: "var(--series-transport)",
  leisure: "var(--series-leisure)",
  other: "var(--series-other)",
};

export function AddVariableExpenseForm({ onDone }: { onDone: () => void }) {
  const addVariableExpense = useBudgetStore((s) => s.addVariableExpense);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("food");
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState("");

  const amountValue = Number(amount);
  const canSubmit = amount !== "" && amountValue > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    addVariableExpense({ amount: amountValue, category, date, note: note.trim() || undefined });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Amount">
        <AmountInput value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
      </FormField>

      <FormField label="Category">
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => {
            const active = cat === category;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className="flex flex-col items-center gap-1.5 rounded-xl py-2.5 text-[12px] font-medium transition-colors"
                style={{
                  background: active ? CATEGORY_COLOR[cat] : "var(--surface-sunken)",
                  color: active ? "white" : "var(--text-secondary)",
                }}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: active ? "white" : CATEGORY_COLOR[cat] }}
                />
                {CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>
      </FormField>

      <FormField label="Date">
        <TextInput type="date" value={date} max={todayIso()} onChange={(e) => setDate(e.target.value)} />
      </FormField>

      <FormField label="Note (optional)">
        <TextInput placeholder="e.g. Groceries" value={note} onChange={(e) => setNote(e.target.value)} />
      </FormField>

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-2 w-full rounded-xl py-3.5 text-[15px] font-semibold text-white disabled:opacity-40"
        style={{ background: "var(--brand)" }}
      >
        Add expense
      </button>
    </form>
  );
}
