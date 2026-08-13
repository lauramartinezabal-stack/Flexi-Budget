import { NavLink } from "react-router-dom";
import { Home, Plus, History, Bell } from "lucide-react";
import { useApp } from "../context/AppContext";
import clsx from "clsx";

export function BottomNav() {
  const { state } = useApp();
  const unreadCount = state.notifications.filter((n) => !n.read).length;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      "flex flex-col items-center justify-center gap-1 py-2 flex-1 text-xs transition-colors",
      isActive ? "text-[var(--color-primary)]" : "text-[var(--color-ink-faint)]"
    );

  return (
    <nav className="sticky bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex items-stretch pb-[env(safe-area-inset-bottom)]">
      <NavLink to="/" end className={linkClass}>
        <Home size={22} strokeWidth={2} />
        Home
      </NavLink>
      <NavLink to="/add" className={linkClass}>
        <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--color-primary)] text-white -mt-4 shadow-md shadow-black/10">
          <Plus size={20} strokeWidth={2.5} />
        </span>
        <span className="mt-0">Add</span>
      </NavLink>
      <NavLink to="/history" className={linkClass}>
        <History size={22} strokeWidth={2} />
        History
      </NavLink>
      <NavLink to="/notifications" className={linkClass}>
        <span className="relative">
          <Bell size={22} strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[var(--color-warn)] text-white text-[10px] leading-4 text-center">
              {unreadCount}
            </span>
          )}
        </span>
        Alerts
      </NavLink>
    </nav>
  );
}
