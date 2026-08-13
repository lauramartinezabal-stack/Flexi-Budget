import { useEffect } from 'react'
import { TopBar } from '../components/TopBar'
import { Card } from '../components/ui/Card'
import { useApp } from '../state/AppContext'
import { Bell, CalendarClock, BellOff } from 'lucide-react'

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function Notifications() {
  const { state, markAllNotificationsRead, markNotificationRead } = useApp()

  useEffect(() => {
    markAllNotificationsRead()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col">
      <TopBar title="Notifications" />
      <div className="flex flex-col gap-3 px-4 py-5">
        {state.notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <BellOff className="text-ink-muted" size={32} />
            <p className="text-[14px] text-ink-muted max-w-[240px]">
              You'll see your weekly spending summary and reminders about upcoming bills here.
            </p>
          </div>
        ) : (
          state.notifications.map((n) => (
            <Card
              key={n.id}
              className={`flex gap-3 ${!n.read ? 'border-brand-300' : ''}`}
              onClick={() => markNotificationRead(n.id)}
            >
              <div className="mt-0.5 shrink-0 text-brand-600">
                {n.type === 'weekly-summary' ? <Bell size={18} /> : <CalendarClock size={18} />}
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium text-ink">{n.title}</span>
                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-caution" aria-hidden />}
                </div>
                <p className="text-[13.5px] text-ink-secondary leading-snug">{n.body}</p>
                <span className="text-[12px] text-ink-muted mt-1">{timeAgo(n.createdAt)}</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
