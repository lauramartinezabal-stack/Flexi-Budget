import { format, parseISO } from "date-fns";
import type { FixedReservation } from "../lib/calc";
import { formatCurrency } from "../lib/format";
import { useBudgetStore } from "../store/budgetStore";

export function FixedExpenseList({
  reservations,
}: {
  reservations: FixedReservation[];
}) {
  const toggleFixedPaid = useBudgetStore((s) => s.toggleFixedPaid);

  if (reservations.length === 0) {
    return (
      <p className="text-sm text-ink-faint py-2">
        No upcoming fixed expenses. Add tuition, rent, or subscriptions to
        start reserving for them automatically.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {reservations.map((r) => {
        const pct = Math.min(
          100,
          Math.round((r.reserved / r.expense.amount) * 100),
        );
        const soon = r.daysUntilDue <= 7;
        return (
          <li key={r.expense.id} className="flex flex-col gap-1.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-ink">
                  {r.expense.name}
                </p>
                <p className="text-xs text-ink-faint">
                  Due {format(parseISO(r.expense.dueDate), "MMM d")}
                  {soon && (
                    <span className="text-amber font-medium">
                      {" "}
                      · {r.daysUntilDue}d left
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-ink">
                  {formatCurrency(r.expense.amount)}
                </p>
                <button
                  type="button"
                  onClick={() => toggleFixedPaid(r.expense.id)}
                  className="text-xs text-primary hover:text-primary-dark underline underline-offset-2"
                >
                  Mark paid
                </button>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-ink-faint">
              {formatCurrency(r.reserved)} reserved
              {r.needed > 0 ? ` · ${formatCurrency(r.needed)} still needed` : " · fully covered"}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
