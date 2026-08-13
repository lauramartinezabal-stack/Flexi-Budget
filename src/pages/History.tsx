import { useMemo, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { Card } from '../components/ui/Card'
import { useApp } from '../state/AppContext'
import { CATEGORIES, type Category } from '../lib/types'
import { formatDateLong, formatMoney } from '../lib/format'
import { ArrowDownCircle, ArrowUpCircle, CalendarClock, Trash2 } from 'lucide-react'

type CategoryFilter = Category | 'all'

export function History() {
  const { state, deleteEntry } = useApp()
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const entries = useMemo(() => {
    return state.entries
      .filter((e) => {
        if (categoryFilter === 'all') return true
        if (e.kind === 'income') return false
        return e.category === categoryFilter
      })
      .filter((e) => {
        const d = e.kind === 'fixed' ? e.dueDate : e.date
        if (from && d < from) return false
        if (to && d > to) return false
        return true
      })
      .sort((a, b) => {
        const da = a.kind === 'fixed' ? a.dueDate : a.date
        const db = b.kind === 'fixed' ? b.dueDate : b.date
        return db.localeCompare(da)
      })
  }, [state.entries, categoryFilter, from, to])

  return (
    <div className="flex flex-col">
      <TopBar title="History" />
      <div className="flex flex-col gap-4 px-4 py-5">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all', ...CATEGORIES.map((c) => c.id)] as CategoryFilter[]).map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium border ${
                categoryFilter === c
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'bg-surface-raised border-border text-ink-secondary'
              }`}
            >
              {c === 'all' ? 'All' : CATEGORIES.find((cat) => cat.id === c)?.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="flex-1 rounded-xl border border-border bg-surface-raised px-3 py-2 text-[13px] text-ink"
            aria-label="From date"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 rounded-xl border border-border bg-surface-raised px-3 py-2 text-[13px] text-ink"
            aria-label="To date"
          />
        </div>

        <div className="flex flex-col gap-2.5">
          {entries.length === 0 ? (
            <p className="text-[14px] text-ink-muted py-10 text-center">No entries match these filters.</p>
          ) : (
            entries.map((e) => {
              const isIncome = e.kind === 'income'
              const isFixed = e.kind === 'fixed'
              const label = isIncome ? e.source || 'Income' : isFixed ? e.name : CATEGORIES.find((c) => c.id === e.category)?.label
              const date = isFixed ? e.dueDate : e.date
              return (
                <Card key={e.id} className="flex items-center gap-3">
                  <div className={`shrink-0 ${isIncome ? 'text-brand-600' : 'text-ink-secondary'}`}>
                    {isIncome ? <ArrowDownCircle size={22} /> : isFixed ? <CalendarClock size={22} /> : <ArrowUpCircle size={22} />}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-[14px] font-medium text-ink">{label}</span>
                    <span className="text-[12.5px] text-ink-muted">
                      {formatDateLong(date)}
                      {isFixed ? (e.paid ? ' · paid' : ' · upcoming') : ''}
                    </span>
                  </div>
                  <span className={`text-[14px] font-semibold tabular-nums ${isIncome ? 'text-brand-600' : 'text-ink'}`}>
                    {isIncome ? '+' : '-'}
                    {formatMoney(e.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteEntry(e.id)}
                    aria-label="Delete entry"
                    className="text-ink-muted p-1 -mr-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
