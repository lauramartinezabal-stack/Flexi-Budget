"use client";

import { useEffect } from "react";
import { CalendarClock, PartyPopper, TrendingUp } from "lucide-react";
import { useBudgetStore } from "@/lib/store";
import { generateNotifications } from "@/lib/notifications";
import { Card } from "@/components/ui/Card";
import { CATEGORY_COLORS } from "@/lib/colors";
import { CATEGORY_LABELS } from "@/lib/types";
import { formatCurrency, formatDateLong, formatDateShort } from "@/lib/format";

export default function NotificationsPage() {
  const hasHydrated = useBudgetStore((s) => s.hasHydrated);
  const incomes = useBudgetStore((s) => s.incomes);
  const expenses = useBudgetStore((s) => s.expenses);
  const markWeeklyNotificationSeen = useBudgetStore((s) => s.markWeeklyNotificationSeen);

  const notifications = hasHydrated ? generateNotifications(incomes, expenses) : [];

  useEffect(() => {
    const mostRecentWeekly = notifications.find((n) => n.type === "weekly");
    if (mostRecentWeekly && mostRecentWeekly.type === "weekly") {
      markWeeklyNotificationSeen(mostRecentWeekly.weekStart);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  if (!hasHydrated) return null;

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 pt-6">
      <h1 className="text-lg font-semibold">Notifications</h1>

      {notifications.length === 0 ? (
        <Card className="text-sm text-foreground-muted">
          No notifications yet. Once you&apos;ve logged a full week of spending, or a fixed
          expense comes within 30 days, you&apos;ll see updates here.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) =>
            n.type === "weekly" ? (
              <Card key={n.id}>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <TrendingUp size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Week of {formatDateShort(n.weekStart)} &ndash; {formatDateShort(n.weekEnd)}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      You spent {formatCurrency(n.totalSpent)} last week
                    </p>
                    <div className="mt-2.5 flex flex-col gap-1.5">
                      {n.categoryBreakdown
                        .filter((c) => c.amount > 0)
                        .map((c) => (
                          <div key={c.category} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: CATEGORY_COLORS[c.category] }}
                              />
                              {CATEGORY_LABELS[c.category]}
                            </span>
                            <span className="text-foreground-muted">
                              {formatCurrency(c.amount)}
                            </span>
                          </div>
                        ))}
                    </div>
                    <div className="mt-3 rounded-lg bg-primary-soft px-3 py-2 text-sm">
                      <span className="font-medium text-primary-strong">
                        {formatCurrency(n.availableNextWeek)}
                      </span>{" "}
                      <span className="text-foreground-muted">available this week</span>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card key={n.id}>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warn-soft text-warn">
                    <CalendarClock size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{n.expenseName} is coming up</p>
                    <p className="text-xs text-foreground-muted">
                      Due {formatDateLong(n.dueDate)} &middot; {n.daysUntilDue} day
                      {n.daysUntilDue === 1 ? "" : "s"} away
                    </p>
                    <p className="mt-2 text-sm">
                      <span className="font-medium">{formatCurrency(n.reserved)}</span>{" "}
                      <span className="text-foreground-muted">
                        reserved of {formatCurrency(n.amount)} needed
                      </span>
                    </p>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full bg-warn"
                        style={{
                          width: `${Math.min(100, Math.round((n.reserved / n.amount) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )
          )}
          <div className="flex items-center justify-center gap-2 py-4 text-xs text-foreground-muted">
            <PartyPopper size={14} /> You&apos;re all caught up
          </div>
        </div>
      )}
    </main>
  );
}
