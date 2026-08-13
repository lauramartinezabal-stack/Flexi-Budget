import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { useAppStore } from '../store/useAppStore'

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 11.5 12 4l8 7.5M6 9.5V20h12V9.5"
      stroke="currentColor"
      strokeWidth={active ? 2.4 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const HistoryIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 6h16M4 12h16M4 18h10"
      stroke="currentColor"
      strokeWidth={active ? 2.4 : 2}
      strokeLinecap="round"
    />
  </svg>
)

const PlusIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="white" strokeWidth={2.4} strokeLinecap="round" />
  </svg>
)

const BellIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z"
      stroke="currentColor"
      strokeWidth={active ? 2.4 : 2}
      strokeLinejoin="round"
    />
    <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth={active ? 2.4 : 2} />
  </svg>
)

function NavItem({
  to,
  label,
  icon,
  badge,
}: {
  to: string
  label: string
  icon: (active: boolean) => React.ReactNode
  badge?: number
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'flex flex-col items-center gap-0.5 py-1.5 px-3 text-[11px] font-medium transition-colors',
          isActive ? 'text-brand-600' : 'text-gray-400 hover:text-brand-400',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className="relative">
            {icon(isActive)}
            {!!badge && (
              <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-coral-low text-white text-[9px] leading-[15px] text-center font-semibold">
                {badge}
              </span>
            )}
          </span>
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export function BottomNav() {
  const unread = useAppStore((s) => s.notifications.filter((n) => !n.read).length)

  return (
    <nav className="sticky bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-sand-200 px-2 pt-1 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between">
        <NavItem to="/" label="Home" icon={(a) => <HomeIcon active={a} />} />
        <NavItem to="/history" label="History" icon={(a) => <HistoryIcon active={a} />} />
        <NavLink
          to="/add"
          className="flex flex-col items-center -mt-6 gap-1 text-[11px] font-medium text-brand-600"
        >
          <span className="w-12 h-12 rounded-full bg-brand-500 shadow-lg shadow-brand-500/30 flex items-center justify-center">
            <PlusIcon />
          </span>
          <span>Add</span>
        </NavLink>
        <NavItem to="/alerts" label="Alerts" icon={(a) => <BellIcon active={a} />} badge={unread} />
      </div>
    </nav>
  )
}
