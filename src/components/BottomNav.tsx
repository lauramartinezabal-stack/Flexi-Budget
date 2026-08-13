import { NavLink } from "react-router-dom";
import clsx from "clsx";

const linkBase =
  "flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors";

function NavIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = {
  home: "M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9",
  history: "M4 4v6h6M3.5 12a8.5 8.5 0 1 0 2.5-6M12 8v4l3 2",
  bell: "M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9ZM9.5 17a2.5 2.5 0 0 0 5 0",
};

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-20 border-t border-sage-200/70 bg-sand-50/95 backdrop-blur supports-backdrop-blur:bg-sand-50/80">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            clsx(linkBase, "w-16", isActive ? "text-sage-700" : "text-sage-400")
          }
        >
          <NavIcon path={ICONS.home} />
          Home
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            clsx(linkBase, "w-16", isActive ? "text-sage-700" : "text-sage-400")
          }
        >
          <NavIcon path={ICONS.history} />
          History
        </NavLink>

        <NavLink
          to="/add"
          className="relative -mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-sage-500 text-white shadow-lg shadow-sage-500/30 transition-transform active:scale-95"
          aria-label="Add income or expense"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </NavLink>

        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            clsx(linkBase, "w-16", isActive ? "text-sage-700" : "text-sage-400")
          }
        >
          <NavIcon path={ICONS.bell} />
          Alerts
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(linkBase, "w-16", isActive ? "text-sage-700" : "text-sage-400")
          }
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="3" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
            />
          </svg>
          Settings
        </NavLink>
      </div>
    </nav>
  );
}
