import { NavLink } from "react-router-dom";
import { BellIcon, HistoryIcon, HomeIcon, PlusIcon } from "../ui/Icons";
import { useUiStore } from "../../store/useUiStore";
import { useBudgetStore } from "../../store/useBudgetStore";

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink to={to} className="flex flex-col items-center justify-center gap-1 py-2.5" end={to === "/"}>
      {({ isActive }) => (
        <>
          <span style={{ color: isActive ? "var(--brand)" : "var(--text-muted)" }}>{icon}</span>
          <span
            className="text-[11px] font-medium"
            style={{ color: isActive ? "var(--brand)" : "var(--text-muted)" }}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

export function BottomNav() {
  const openPicker = useUiStore((s) => s.openPicker);
  const unreadCount = useBudgetStore((s) => s.notifications.filter((n) => !n.read).length);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]"
      style={{ background: "var(--surface-card)", borderTop: "1px solid var(--border-hairline)" }}
    >
      <div className="relative mx-auto grid w-full max-w-md grid-cols-3 items-center px-4">
        <NavItem to="/" icon={<HomeIcon />} label="Home" />
        <NavItem to="/history" icon={<HistoryIcon />} label="History" />
        <div className="relative flex justify-self-end">
          <NavItem to="/notifications" icon={<BellIcon />} label="Alerts" />
          {unreadCount > 0 && (
            <span
              className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
              style={{ background: "var(--status-critical)" }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>

        <button
          onClick={openPicker}
          aria-label="Add income or expense"
          className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-lg active:scale-95 transition-transform"
          style={{ background: "var(--brand)", boxShadow: "0 6px 18px rgba(26,143,114,0.35)" }}
        >
          <PlusIcon />
        </button>
      </div>
    </nav>
  );
}
