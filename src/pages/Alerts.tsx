import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/Card'

const KIND_ICON: Record<string, string> = {
  'weekly-summary': '📅',
  'fixed-expense-approaching': '⏰',
}

export default function Alerts() {
  const notifications = useAppStore((s) => s.notifications)
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead)
  const markNotificationRead = useAppStore((s) => s.markNotificationRead)

  useEffect(() => {
    markAllNotificationsRead()
  }, [markAllNotificationsRead])

  const sorted = [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="pb-8">
      <PageHeader title="Alerts" subtitle="Weekly summaries & bill reminders" />
      <div className="px-5 space-y-3 mt-1">
        {sorted.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-400">
              No alerts yet. You'll get a weekly spending summary and a heads-up before big bills
              are due.
            </p>
          </Card>
        ) : (
          sorted.map((n) => (
            <Card key={n.id} className="!p-4" title={undefined}>
              <button
                onClick={() => markNotificationRead(n.id)}
                className="w-full text-left flex gap-3"
              >
                <span className="text-xl leading-none mt-0.5">{KIND_ICON[n.kind] ?? '🔔'}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-brand-900">{n.title}</p>
                  <p className="text-[13px] text-gray-500 whitespace-pre-line mt-0.5">{n.body}</p>
                  <p className="text-[11px] text-gray-300 mt-1.5">
                    {new Date(n.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-coral-low mt-1.5 shrink-0" />}
              </button>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
