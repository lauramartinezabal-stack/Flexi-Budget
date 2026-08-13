import { Bell, Home, ListTree, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";

export function BottomNav({ onAddClick }: { onAddClick: () => void }) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${
      isActive ? "text-primary-dark" : "text-ink-faint"
    }`;

  return (
    <nav className="sticky bottom-0 left-0 right-0 border-t border-border bg-surface/95 backdrop-blur px-4 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
      <div className="flex items-center justify-between">
        <NavLink to="/" end className={linkClass}>
          <Home size={22} strokeWidth={2} />
          Home
        </NavLink>
        <NavLink to="/history" className={linkClass}>
          <ListTree size={22} strokeWidth={2} />
          History
        </NavLink>

        <button
          type="button"
          onClick={onAddClick}
          aria-label="Add income or expense"
          className="flex items-center justify-center h-14 w-14 -mt-6 rounded-full bg-primary text-white shadow-lg shadow-primary/30 active:scale-95 transition-transform"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>

        <NavLink to="/notifications" className={linkClass}>
          <Bell size={22} strokeWidth={2} />
          Alerts
        </NavLink>
        <div className="w-[46px]" aria-hidden="true" />
      </div>
    </nav>
  );
}
