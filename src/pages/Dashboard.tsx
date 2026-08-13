import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { computeAverageWeeklySpend, computeBudget, getCategoryBreakdown } from '../lib/budget'
import { formatCurrency, formatDateShort } from '../lib/format'
import { Card } from '../components/Card'
import { ProgressBar } from '../components/ProgressBar'
import { CategoryDonut } from '../components/CategoryDonut'
import { PageHeader } from '../components/PageHeader'

function heroTone(weeklyAvailable: number, avgWeeklySpend: number, hasIncome: boolean) {
  if (!hasIncome) return { bg: 'bg-brand-500', text: 'text-white', sub: 'text-brand-50' }
  if (weeklyAvailable <= 0) return { bg: 'bg-coral-low', text: 'text-white', sub: 'text-white/80' }
  if (avgWeeklySpend > 0 && weeklyAvailable < avgWeeklySpend * 0.6)
    return { bg: 'bg-amber-warn', text: 'text-white', sub: 'text-white/80' }
  return { bg: 'bg-brand-500', text: 'text-white', sub: 'text-brand-50' }
}

export default function Dashboard() {
  const incomes = useAppStore((s) => s.incomes)
  const fixedExpenses = useAppStore((s) => s.fixedExpenses)
  const variableExpenses = useAppStore((s) => s.variableExpenses)
  const settings = useAppStore((s) => s.settings)
  const toggleFixedExpensePaid = useAppStore((s) => s.toggleFixedExpensePaid)

  const now = useMemo(() => new Date(), [])
  const summary = useMemo(
    () => computeBudget(incomes, fixedExpenses, variableExpenses, settings.defaultHorizonWeeks, now),
    [incomes, fixedExpenses, variableExpenses, settings.defaultHorizonWeeks, now],
  )
  const breakdown = useMemo(() => getCategoryBreakdown(variableExpenses, now), [variableExpenses, now])

  const unpaidUpcoming = fixedExpenses
    .filter((e) => !e.paid)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  const avgWeeklySpend = useMemo(() => computeAverageWeeklySpend(variableExpenses, now), [variableExpenses, now])
  const tone = heroTone(summary.weeklyAvailable, avgWeeklySpend, incomes.length > 0)
  const hasAnyData = incomes.length > 0 || fixedExpenses.length > 0 || variableExpenses.length > 0

  return (
    <div className="pb-8">
      <PageHeader title="Flexi Budget" subtitle="Your dynamic weekly budget" />

      <div className="px-5 space-y-4 mt-1">
        <section className={`rounded-2xl p-6 ${tone.bg} shadow-lg shadow-brand-900/10`}>
          <p className={`text-[13px] font-medium uppercase tracking-wide ${tone.sub}`}>
            Available this week
          </p>
          <p className={`text-5xl font-bold mt-1.5 ${tone.text}`}>
            {formatCurrency(summary.weeklyAvailable, true)}
          </p>
          <p className={`text-[13px] mt-2 ${tone.sub}`}>
            {incomes.length === 0
              ? 'Log your first income to see this update'
              : summary.nearestDueDate
                ? `Spread over ${summary.horizonWeeks} week${summary.horizonWeeks > 1 ? 's' : ''} until your next fixed expense on ${formatDateShort(summary.nearestDueDate)}`
                : `Spread over your default ${summary.horizonWeeks}-week horizon`}
          </p>
        </section>

        {!hasAnyData && (
          <Card>
            <p className="text-sm text-gray-500 leading-relaxed">
              Welcome! Log your first bit of income or an upcoming expense to see your weekly
              spendable amount.
            </p>
            <Link
              to="/add"
              className="inline-block mt-3 text-brand-600 font-semibold text-sm hover:underline"
            >
              Add income or expense →
            </Link>
          </Card>
        )}

        <Card
          title="Upcoming fixed expenses"
          action={
            <Link to="/add?type=fixed" className="text-brand-600 text-[13px] font-semibold hover:underline">
              + Add
            </Link>
          }
        >
          {unpaidUpcoming.length === 0 ? (
            <p className="text-sm text-gray-400">No upcoming fixed expenses. Nice and clear.</p>
          ) : (
            <ul className="space-y-4">
              {unpaidUpcoming.map((exp) => {
                const r = summary.reservations[exp.id]
                const reserved = r?.reserved ?? 0
                const pct = exp.amount > 0 ? reserved / exp.amount : 0
                return (
                  <li key={exp.id}>
                    <div className="flex items-center justify-between text-[14px]">
                      <span className="font-medium text-brand-900">{exp.name}</span>
                      <span className="text-gray-500">{formatDateShort(exp.dueDate)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 mb-1.5">
                      <span className="text-[12px] text-gray-400">
                        {formatCurrency(reserved)} reserved of {formatCurrency(exp.amount)}
                      </span>
                      <button
                        onClick={() => toggleFixedExpensePaid(exp.id)}
                        className="text-[11px] font-semibold text-brand-500 hover:text-brand-700"
                      >
                        Mark paid
                      </button>
                    </div>
                    <ProgressBar
                      progress={pct}
                      colorClassName={pct >= 1 ? 'bg-brand-500' : 'bg-brand-300'}
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card title="Spending by category" className="pb-5">
          <CategoryDonut items={breakdown.items} total={breakdown.total} />
          {breakdown.isFallbackAllTime && breakdown.total > 0 && (
            <p className="text-[11px] text-gray-400 mt-3">
              No spending logged this week yet — showing all-time totals.
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
