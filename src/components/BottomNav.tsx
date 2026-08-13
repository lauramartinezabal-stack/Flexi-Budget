"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Clock, Bell } from "lucide-react";
import { useBudgetStore } from "@/lib/store";
import { generateNotifications } from "@/lib/notifications";
import { weekKey } from "@/lib/budget";
import { addDays, startOfWeek } from "date-fns";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/add", label: "Add", icon: PlusCircle },
  { href: "/history", label: "History", icon: Clock },
  { href: "/notifications", label: "Alerts", icon: Bell },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const hasHydrated = useBudgetStore((s) => s.hasHydrated);
  const incomes = useBudgetStore((s) => s.incomes);
  const expenses = useBudgetStore((s) => s.expenses);
  const lastSeen = useBudgetStore((s) => s.lastWeeklyNotificationWeekKey);

  let hasUnseen = false;
  if (hasHydrated) {
    const notifications = generateNotifications(incomes, expenses);
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const previousCompletedWeekKey = weekKey(addDays(currentWeekStart, -1));
    const hasNewWeekly =
      notifications.some((n) => n.type === "weekly" && n.weekStart === previousCompletedWeekKey) &&
      lastSeen !== previousCompletedWeekKey;
    const hasUrgentMonthly = notifications.some(
      (n) => n.type === "monthly" && n.daysUntilDue <= 7
    );
    hasUnseen = hasNewWeekly || hasUrgentMonthly;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors ${
                active ? "text-primary" : "text-foreground-muted"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              {label === "Alerts" && hasUnseen && (
                <span className="absolute right-[28%] top-1.5 h-2 w-2 rounded-full bg-warn" />
              )}
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
