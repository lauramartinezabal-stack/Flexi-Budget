import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../state/AppContext'
import {
  categoryTotals,
  computeReservations,
  computeWeeklyBudget,
  currentWeekWindow,
} from '../lib/engine'
import { formatDateShort, formatMoney } from '../lib/format'
import { Card } from '../components/ui/Card'
import { CategoryBreakdown } from '../components/CategoryBreakdown'
import { CalendarClock, CheckCircle2 } from 'lucide-react'

export function Home() {
  const { state, markFixedPaid } = useApp()

  const budget = useMemo(() => computeWeeklyBudget(state.entries), [state.entries])
  const { reservations } = useMemo(() => computeReservations(state.entries), [state.entries])
  const week = useMemo(() => currentWeekWindow(), [])
  const totals = useMemo(() => categoryTotals(state.entries, week.start, week.end), [state.entries, week])

  const hasIncome = state.entries.some((e) => e.kind === 'income')
  const ratio = budget.weeklyAllowance > 0 ? budget.availableThisWeek / budget.weeklyAllowance : 0
  const tone = !hasIncome ? 'neutral' : ratio <= 0.1 ? 'critical' : ratio <= 0.3 ? 'caution' : 'good'
  const toneClasses = {
    good: 'text-brand-600',
    caution: 'text-caution',
    critical: 'text-critical',
    neutral: 'text-ink',
  } as const

  return (
    <div className="flex flex-col gap-5 px-4 py-5">
      <Card className="flex flex-col items-center gap-1.5 text-center py-7">
        <span className="text-[13px] font-medium text-ink-muted uppercase tracking-wide">Available this week</span>
        <span className={`text-[44px] font-semibold leading-none tabular-nums ${toneClasses[tone]}`}>
          {formatMoney(budget.availableThisWeek)}
        </span>
        <span className="text-[13px] text-ink-muted mt-1">
          {hasIncome ? (
            <>
              {formatMoney(budget.spentThisWeek)} spent of {formatMoney(budget.weeklyAllowance)} weekly allowance
            </>
          ) : (
            <Link to="/add/income" className="text-brand-600 font-medium">
              Log your first income to get started
            </Link>
          )}
        </span>
      </Card>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-ink">Upcoming fixed expenses</h2>
          <Link to="/add/expense" className="text-[13px] font-medium text-brand-600">
            Add
          </Link>
        </div>
        {reservations.length === 0 ? (
          <Card>
            <p className="text-[14px] text-ink-muted">No upcoming fixed expenses. Add rent, tuition, or a subscription to start reserving for it.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {reservations.map(({ expense, reserved, stillNeeded }) => {
              const pct = expense.amount > 0 ? Math.min(100, (reserved / expense.amount) * 100) : 0
              return (
                <Card key={expense.id} className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-ink">{expense.name}</span>
                      <span className="flex items-center gap-1 text-[12.5px] text-ink-muted mt-0.5">
                        <CalendarClock size={13} /> Due {formatDateShort(expense.dueDate)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[14px] font-semibold text-ink tabular-nums">{formatMoney(expense.amount)}</span>
                      <button
                        type="button"
                        onClick={() => markFixedPaid(expense.id, true)}
                        className="flex items-center gap-1 text-[12px] text-brand-600 mt-0.5"
                      >
                        <CheckCircle2 size={13} /> Mark paid
                      </button>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-brand-50 overflow-hidden">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.max(3, pct)}%` }} />
                  </div>
                  <span className="text-[12.5px] text-ink-muted">
                    {formatMoney(reserved)} reserved
                    {stillNeeded > 0 ? ` · ${formatMoney(stillNeeded)} still needed` : ' · fully reserved'}
                  </span>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-semibold text-ink">Spending by category</h2>
        <Card>
          <CategoryBreakdown totals={totals} />
        </Card>
      </section>
    </div>
  )
}
