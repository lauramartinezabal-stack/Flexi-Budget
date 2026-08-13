import { useEffect } from "react";
import { useBudgetStore } from "../store/useBudgetStore";
import { Card, SectionTitle } from "../components/ui/Card";
import { BellIcon, CalendarIcon } from "../components/ui/Icons";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function Notifications() {
  const notifications = useBudgetStore((s) => s.notifications);
  const markNotificationRead = useBudgetStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useBudgetStore((s) => s.markAllNotificationsRead);
  const runNotificationCheck = useBudgetStore((s) => s.runNotificationCheck);

  useEffect(() => {
    runNotificationCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          Notifications
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="text-[12px] font-semibold"
            style={{ color: "var(--brand)" }}
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="p-8 text-center">
          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: "var(--surface-sunken)", color: "var(--text-muted)" }}
          >
            <BellIcon />
          </div>
          <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
            No notifications yet. You'll get a weekly spending summary and a heads-up when a big bill is
            approaching.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2.5">
          <SectionTitle>{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}</SectionTitle>
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className="w-full text-left"
            >
              <Card
                className="flex items-start gap-3 p-4"
                style={{ background: n.read ? "var(--surface-card)" : "var(--brand-soft)" }}
              >
                <span
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: n.read ? "var(--surface-sunken)" : "var(--brand)",
                    color: n.read ? "var(--text-secondary)" : "white",
                  }}
                >
                  {n.type === "weekly-summary" ? <BellIcon size={16} /> : <CalendarIcon size={16} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--brand)" }} />
                    )}
                  </div>
                  <p className="mt-0.5 text-[13px] leading-snug" style={{ color: "var(--text-secondary)" }}>
                    {n.body}
                  </p>
                  <p className="mt-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
