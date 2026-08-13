import { Home, ListTree, Bell, PlusCircle } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../state/AppContext'

const navItemClasses = ({ isActive }: { isActive: boolean }) =>
  `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
    isActive ? 'text-brand-600' : 'text-ink-muted'
  }`

export function BottomNav() {
  const { state } = useApp()
  const unread = state.notifications.filter((n) => !n.read).length

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-10 bg-surface-raised border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch">
        <NavLink to="/" end className={navItemClasses}>
          <Home size={22} strokeWidth={2} />
          Home
        </NavLink>
        <NavLink to="/history" className={navItemClasses}>
          <ListTree size={22} strokeWidth={2} />
          History
        </NavLink>
        <NavLink to="/add" className={navItemClasses}>
          <PlusCircle size={22} strokeWidth={2} />
          Add
        </NavLink>
        <NavLink to="/notifications" className={navItemClasses}>
          <div className="relative">
            <Bell size={22} strokeWidth={2} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-1.5 h-2 w-2 rounded-full bg-caution" aria-hidden />
            )}
          </div>
          Alerts
        </NavLink>
      </div>
    </nav>
  )
}
