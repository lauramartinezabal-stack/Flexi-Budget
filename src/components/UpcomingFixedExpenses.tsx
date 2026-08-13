import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import { formatDateShort } from "@/lib/format";
import type { ReservedFixedExpense } from "@/lib/budget";

interface Props {
  expenses: ReservedFixedExpense[];
}

export function UpcomingFixedExpenses({ expenses }: Props) {
  return (
    <section>
      <h2 className="mb-3 text-base font-semibold">Upcoming fixed expenses</h2>
      {expenses.length === 0 ? (
        <Card className="text-sm text-foreground-muted">
          No upcoming fixed expenses. Add tuition, rent, or subscriptions to start reserving
          for them automatically.
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {expenses.map((e) => {
            const pct = e.amount > 0 ? Math.min(100, Math.round((e.reserved / e.amount) * 100)) : 0;
            return (
              <Card key={e.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{e.name}</p>
                    <p className="text-xs text-foreground-muted">
                      Due {formatDateShort(e.dueDate)} &middot; {e.daysUntilDue} day
                      {e.daysUntilDue === 1 ? "" : "s"} left
                    </p>
                  </div>
                  <p className="whitespace-nowrap font-semibold">{formatCurrency(e.amount)}</p>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-foreground-muted">
                  {formatCurrency(e.reserved)} reserved ({pct}%)
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
