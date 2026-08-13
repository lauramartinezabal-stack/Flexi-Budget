import { CalendarClock, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { generateNotifications } from "../lib/calc";
import { useBudgetStore } from "../store/budgetStore";

export function Notifications() {
  const incomes = useBudgetStore((s) => s.incomes);
  const expenses = useBudgetStore((s) => s.expenses);

  const notifications = useMemo(
    () => generateNotifications(incomes, expenses),
    [incomes, expenses],
  );

  return (
    <div className="flex flex-col gap-5 px-5 pb-6">
      <PageHeader title="Alerts" />
      <p className="text-sm text-ink-faint -mt-2">
        Your weekly digest and reminders about upcoming bills
      </p>

      {notifications.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-ink-soft">
            Nothing to report yet. Log some income and expenses to see your
            weekly summary here.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={n.urgent ? "border-amber/40 bg-amber-soft/40" : ""}
            >
              <div className="flex gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    n.type === "weekly"
                      ? "bg-primary-soft text-primary-dark"
                      : n.urgent
                        ? "bg-amber-soft text-amber"
                        : "bg-surface-muted text-ink-soft"
                  }`}
                >
                  {n.type === "weekly" ? (
                    <Sparkles size={18} />
                  ) : (
                    <CalendarClock size={18} />
                  )}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink">{n.title}</p>
                  <p className="text-sm text-ink-soft mt-0.5">{n.body}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
