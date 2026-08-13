import { useUiStore } from "../../store/useUiStore";
import { Sheet } from "../ui/Sheet";
import { ArrowDownIcon, ArrowUpIcon, CalendarIcon } from "../ui/Icons";
import { AddIncomeForm } from "./AddIncomeForm";
import { AddVariableExpenseForm } from "./AddVariableExpenseForm";
import { AddFixedExpenseForm } from "./AddFixedExpenseForm";

function PickerOption({
  icon,
  title,
  subtitle,
  onClick,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  accent: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3.5 rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
      style={{ background: "var(--surface-sunken)" }}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        style={{ background: accent, color: "white" }}
      >
        {icon}
      </span>
      <span>
        <span className="block text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
          {title}
        </span>
        <span className="block text-[13px]" style={{ color: "var(--text-secondary)" }}>
          {subtitle}
        </span>
      </span>
    </button>
  );
}

export function AddEntrySheet() {
  const addSheet = useUiStore((s) => s.addSheet);
  const closeSheet = useUiStore((s) => s.closeSheet);
  const openPicker = useUiStore((s) => s.openPicker);
  const openIncome = useUiStore((s) => s.openIncome);
  const openVariableExpense = useUiStore((s) => s.openVariableExpense);
  const openFixedExpense = useUiStore((s) => s.openFixedExpense);

  if (addSheet === "closed") return null;

  if (addSheet === "picker") {
    return (
      <Sheet title="Add" onClose={closeSheet}>
        <div className="flex flex-col gap-2.5">
          <PickerOption
            icon={<ArrowUpIcon />}
            title="Income"
            subtitle="Money that came in — any day, any source"
            accent="var(--brand)"
            onClick={openIncome}
          />
          <PickerOption
            icon={<ArrowDownIcon />}
            title="Expense"
            subtitle="Something you spent, day to day"
            accent="var(--series-transport)"
            onClick={openVariableExpense}
          />
          <PickerOption
            icon={<CalendarIcon />}
            title="Upcoming fixed expense"
            subtitle="Rent, tuition, a bill with a due date"
            accent="var(--series-food)"
            onClick={openFixedExpense}
          />
        </div>
      </Sheet>
    );
  }

  if (addSheet === "income") {
    return (
      <Sheet title="Add income" onClose={closeSheet} onBack={openPicker}>
        <AddIncomeForm onDone={closeSheet} />
      </Sheet>
    );
  }

  if (addSheet === "variable-expense") {
    return (
      <Sheet title="Add expense" onClose={closeSheet} onBack={openPicker}>
        <AddVariableExpenseForm onDone={closeSheet} />
      </Sheet>
    );
  }

  return (
    <Sheet title="Add fixed expense" onClose={closeSheet} onBack={openPicker}>
      <AddFixedExpenseForm onDone={closeSheet} />
    </Sheet>
  );
}
