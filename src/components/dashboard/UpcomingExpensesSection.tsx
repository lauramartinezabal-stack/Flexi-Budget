import type { ReserveLine } from "../../lib/engine";
import { formatMoney, formatRelativeDay } from "../../lib/format";
import { Card, SectionTitle } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import { CalendarIcon } from "../ui/Icons";
import { useUiStore } from "../../store/useUiStore";

function dueTone(daysUntilDue: number): string {
  if (daysUntilDue <= 3) return "var(--status-critical)";
  if (daysUntilDue <= 10) return "var(--status-warning)";
  return "var(--brand)";
}

export function UpcomingExpensesSection({ lines }: { lines: ReserveLine[] }) {
  const openFixedExpense = useUiStore((s) => s.openFixedExpense);

  return (
    <section className="mt-6">
      <SectionTitle>Upcoming fixed expenses</SectionTitle>
      {lines.length === 0 ? (
        <Card className="p-5 text-center">
          <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
            No fixed expenses yet. Add tuition, rent, or a subscription to start reserving for it automatically.
          </p>
          <button
            onClick={openFixedExpense}
            className="mt-3 text-[13px] font-semibold"
            style={{ color: "var(--brand)" }}
          >
            + Add one
          </button>
        </Card>
      ) : (
        <div className="flex flex-col gap-2.5">
          {lines.map((line) => (
            <Card key={line.expense.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "var(--surface-sunken)", color: "var(--text-secondary)" }}
                  >
                    <CalendarIcon size={16} />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
                      {line.expense.label}
                    </p>
                    <p className="text-[12px] font-medium" style={{ color: dueTone(line.daysUntilDue) }}>
                      {formatRelativeDay(line.expense.dueDate)}
                    </p>
                  </div>
                </div>
                <p className="text-[15px] font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
                  {formatMoney(line.expense.amount)}
                </p>
              </div>
              <div className="mt-3">
                <ProgressBar progress={line.progress} color="var(--brand)" />
                <p className="mt-1.5 text-[12px]" style={{ color: "var(--text-muted)" }}>
                  {formatMoney(line.reserved)} reserved · {formatMoney(line.stillNeeded)} still needed
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
