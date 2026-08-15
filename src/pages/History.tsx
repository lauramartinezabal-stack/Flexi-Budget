import { useMemo, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { effectiveSavingsTarget } from '../lib/budget'
import { formatCurrency, formatDateHuman } from '../lib/format'
import { CATEGORIES, type Category } from '../types'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/Card'
import { SegmentedControl, TextInput } from '../components/FormFields'

type TypeFilter = 'all' | 'income' | 'variable' | 'fixed' | 'savings'

interface Row {
  id: string
  kind: 'income' | 'variable' | 'fixed' | 'savings'
  date: string
  label: string
  sub?: string
  amount: number
  category?: Category
  recurring?: boolean
}

export default function History() {
  const incomes = useAppStore((s) => s.incomes)
  const variableExpenses = useAppStore((s) => s.variableExpenses)
  const fixedExpenses = useAppStore((s) => s.fixedExpenses)
  const savingsGoals = useAppStore((s) => s.savingsGoals)
  const removeIncome = useAppStore((s) => s.removeIncome)
  const removeVariableExpense = useAppStore((s) => s.removeVariableExpense)
  const removeFixedExpense = useAppStore((s) => s.removeFixedExpense)
  const removeSavingsGoal = useAppStore((s) => s.removeSavingsGoal)

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const now = useMemo(() => new Date(), [])

  const rows: Row[] = useMemo(() => {
    const incomeRows: Row[] = incomes.map((i) => ({
      id: i.id,
      kind: 'income',
      date: i.date,
      label: i.source || 'Income',
      sub: i.recurring
        ? `${formatCurrency(i.amount, true)}/mo${i.recurring.endDate ? ` until ${formatDateHuman(i.recurring.endDate)}` : ''}`
        : undefined,
      amount: i.amount,
      recurring: !!i.recurring,
    }))
    const variableRows: Row[] = variableExpenses.map((e) => ({
      id: e.id,
      kind: 'variable',
      date: e.date,
      label: CATEGORIES.find((c) => c.id === e.category)?.label ?? e.category,
      sub: e.note,
      amount: -e.amount,
      category: e.category,
    }))
    const fixedRows: Row[] = fixedExpenses.map((e) => ({
      id: e.id,
      kind: 'fixed',
      date: e.dueDate,
      label: e.name,
      sub: e.recurring ? 'Monthly bill' : e.paid ? 'Paid' : 'Upcoming bill',
      amount: -e.amount,
      recurring: !!e.recurring,
    }))
    const savingsRows: Row[] = savingsGoals.map((g) => ({
      id: g.id,
      kind: 'savings',
      date: g.startDate ?? g.targetDate ?? g.createdAt.slice(0, 10),
      label: g.name,
      sub: g.achieved
        ? 'Achieved'
        : g.monthlyContribution != null
          ? `Monthly fund · ${formatCurrency(g.monthlyContribution, true)}/mo`
          : 'Savings goal',
      amount: -effectiveSavingsTarget(g, now),
      recurring: g.monthlyContribution != null,
    }))
    return [...incomeRows, ...variableRows, ...fixedRows, ...savingsRows].sort((a, b) =>
      b.date.localeCompare(a.date),
    )
  }, [incomes, variableExpenses, fixedExpenses, savingsGoals, now])

  const filtered = rows.filter((r) => {
    if (typeFilter !== 'all' && r.kind !== typeFilter) return false
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false
    if (from && r.date < from) return false
    if (to && r.date > to) return false
    return true
  })

  function remove(row: Row) {
    if (row.kind === 'income') removeIncome(row.id)
    if (row.kind === 'variable') removeVariableExpense(row.id)
    if (row.kind === 'fixed') removeFixedExpense(row.id)
    if (row.kind === 'savings') removeSavingsGoal(row.id)
  }

  return (
    <div className="pb-8">
      <PageHeader title="History" subtitle="Every entry, in one place" />
      <div className="px-5 space-y-4 mt-1">
        <Card>
          <div className="space-y-3">
            <SegmentedControl
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'all', label: 'All' },
                { value: 'income', label: 'Income' },
                { value: 'variable', label: 'Spent' },
                { value: 'fixed', label: 'Bills' },
                { value: 'savings', label: 'Savings' },
              ]}
            />
            <div className="flex gap-2">
              <TextInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="text-[13px] py-2" />
              <TextInput type="date" value={to} onChange={(e) => setTo(e.target.value)} className="text-[13px] py-2" />
            </div>
            {(typeFilter === 'all' || typeFilter === 'variable') && (
              <div className="flex flex-wrap gap-1.5">
                <FilterChip active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>
                  All categories
                </FilterChip>
                {CATEGORIES.map((c) => (
                  <FilterChip key={c.id} active={categoryFilter === c.id} onClick={() => setCategoryFilter(c.id)}>
                    {c.icon} {c.label}
                  </FilterChip>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400">No entries match these filters.</p>
          ) : (
            <ul className="divide-y divide-sand-200">
              {filtered.map((r) => (
                <li key={`${r.kind}-${r.id}`} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-brand-900 truncate">
                      {r.recurring && r.kind !== 'savings' && '🔁 '}
                      {r.label}
                    </p>
                    <p className="text-[12px] text-gray-400">
                      {formatDateHuman(r.date)}
                      {r.sub ? ` · ${r.sub}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[14px] font-semibold ${
                        r.kind === 'savings'
                          ? 'text-plum-500'
                          : r.amount < 0
                            ? 'text-gray-600'
                            : 'text-brand-600'
                      }`}
                    >
                      {r.kind === 'savings' ? (r.recurring ? '🏦 ' : '🐷 ') : r.amount < 0 ? '-' : '+'}
                      {formatCurrency(Math.abs(r.amount), true)}
                    </span>
                    <button
                      onClick={() => remove(r)}
                      aria-label="Delete entry"
                      className="text-gray-300 hover:text-coral-low text-[13px] px-1"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
        active ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-sand-200 text-gray-500'
      }`}
    >
      {children}
    </button>
  )
}
