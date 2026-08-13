import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Calendar, TrendingUp } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Header } from "../components/Header";

export function Notifications() {
  const { state, dispatch } = useApp();
  const items = state.notifications
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  useEffect(() => {
    if (items.some((n) => !n.read)) {
      const timeout = setTimeout(() => dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ" }), 800);
      return () => clearTimeout(timeout);
    }
  }, [items.length]);

  return (
    <div className="flex-1 pb-24">
      <Header title="Notifications" />
      <div className="px-5">
        {items.length === 0 ? (
          <div className="bg-[var(--color-surface-muted)] rounded-2xl px-4 py-8 text-sm text-[var(--color-ink-faint)] text-center">
            You're all caught up. Weekly summaries and upcoming-expense alerts will show up here.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((n) => (
              <div
                key={n.id}
                className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] px-4 py-3.5 flex gap-3"
              >
                <div
                  className={
                    n.kind === "weekly-summary"
                      ? "w-9 h-9 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0"
                      : "w-9 h-9 rounded-full bg-[var(--color-warn-soft)] text-[var(--color-warn)] flex items-center justify-center shrink-0"
                  }
                >
                  {n.kind === "weekly-summary" ? <TrendingUp size={16} /> : <Calendar size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[var(--color-ink)]">{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[var(--color-warn)] shrink-0" />}
                  </div>
                  <p className="text-sm text-[var(--color-ink-soft)] mt-0.5">{n.body}</p>
                  <p className="text-xs text-[var(--color-ink-faint)] mt-1.5">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
