import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import {
  computeAverageWeeklySpend,
  computeBudget,
  computeCategorySplit,
  effectiveSavingsTarget,
} from '../lib/budget'
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
  const savingsGoals = useAppStore((s) => s.savingsGoals)
  const settings = useAppStore((s) => s.settings)
  const toggleFixedExpensePaid = useAppStore((s) => s.toggleFixedExpensePaid)
  const toggleSavingsGoalAchieved = useAppStore((s) => s.toggleSavingsGoalAchieved)

  const now = useMemo(() => new Date(), [])
  const summary = useMemo(
    () =>
      computeBudget(
        incomes,
        fixedExpenses,
        variableExpenses,
        savingsGoals,
        settings.defaultHorizonWeeks,
        now,
      ),
    [incomes, fixedExpenses, variableExpenses, savingsGoals, settings.defaultHorizonWeeks, now],
  )
  const categorySplit = useMemo(
    () => computeCategorySplit(summary.weeklyAvailable, variableExpenses, now),
    [summary.weeklyAvailable, variableExpenses, now],
  )
  const weeklySpent = categorySplit.items.reduce((sum, i) => sum + i.spentThisWeek, 0)

  const unpaidUpcoming = fixedExpenses
    .filter((e) => !e.paid)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const unachievedGoals = savingsGoals
    .filter((g) => !g.achieved)
    .sort((a, b) => (a.targetDate ?? '9999').localeCompare(b.targetDate ?? '9999'))

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
              : `Spread over your ${summary.horizonWeeks}-week horizon, after setting aside your bills and savings`}
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
                      <span className="font-medium text-brand-900">
                        {exp.recurring && '🔁 '}
                        {exp.name}
                      </span>
                      <span className="text-gray-500">{formatDateShort(exp.dueDate)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 mb-1.5">
                      <span className="text-[12px] text-gray-400">
                        {formatCurrency(reserved)} reserved of {formatCurrency(exp.amount)}
                        {exp.recurring && ' · monthly'}
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

        <Card
          title="Savings goals"
          action={
            <Link to="/add?type=savings" className="text-plum-500 text-[13px] font-semibold hover:underline">
              + Add
            </Link>
          }
        >
          {unachievedGoals.length === 0 ? (
            <p className="text-sm text-gray-400">
              No goals yet. Add a one-off goal or a monthly fund and we'll set money aside once
              your bills are covered.
            </p>
          ) : (
            <ul className="space-y-4">
              {unachievedGoals.map((goal) => {
                const isFund = goal.monthlyContribution != null
                const r = summary.savingsReservations[goal.id]
                const reserved = r?.reserved ?? 0
                const target = effectiveSavingsTarget(goal, now)
                const pct = target > 0 ? reserved / target : 0
                const fullyFunded = pct >= 1
                const goalComplete = !isFund && fullyFunded
                return (
                  <li key={goal.id}>
                    <div className="flex items-center justify-between text-[14px]">
                      <span className="font-medium text-brand-900">
                        {isFund ? '🏦' : '🐷'} {goal.name}
                      </span>
                      <span className="text-gray-500">
                        {isFund
                          ? goal.endDate
                            ? `Until ${formatDateShort(goal.endDate)}`
                            : 'Ongoing'
                          : goal.targetDate
                            ? formatDateShort(goal.targetDate)
                            : 'No deadline'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 mb-1.5">
                      <span className="text-[12px] text-gray-400">
                        {isFund
                          ? `${formatCurrency(reserved)} saved · ${formatCurrency(goal.monthlyContribution ?? 0)}/mo`
                          : `${formatCurrency(reserved)} saved of ${formatCurrency(goal.targetAmount ?? 0)}`}
                      </span>
                      {goalComplete && (
                        <button
                          onClick={() => toggleSavingsGoalAchieved(goal.id)}
                          className="text-[11px] font-semibold text-plum-500 hover:text-plum-700"
                        >
                          Mark achieved
                        </button>
                      )}
                      {isFund && (
                        <button
                          onClick={() => toggleSavingsGoalAchieved(goal.id)}
                          className="text-[11px] font-semibold text-gray-400 hover:text-plum-700"
                        >
                          Close fund
                        </button>
                      )}
                    </div>
                    <ProgressBar
                      progress={pct}
                      colorClassName={fullyFunded ? 'bg-plum-500' : 'bg-plum-300'}
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card title="This week's plan" className="pb-5">
          <CategoryDonut items={categorySplit.items} total={weeklySpent} showCaps />
          <p className="text-[11px] text-gray-400 mt-3">
            {categorySplit.isPersonalized
              ? 'Caps are based on your usual spending split, so essentials stay covered.'
              : 'Starting with a sensible default split — this will adapt to your habits after a bit more history.'}
          </p>
        </Card>
      </div>
    </div>
  )
}
