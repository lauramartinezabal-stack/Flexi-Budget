import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import { Field, inputClasses } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { useApp } from '../state/AppContext'
import { todayIso } from '../lib/format'
import { CATEGORIES, type Category } from '../lib/types'

type ExpenseType = 'variable' | 'fixed'

export function AddExpense() {
  const { addVariableExpense, addFixedExpense } = useApp()
  const navigate = useNavigate()
  const [type, setType] = useState<ExpenseType>('variable')

  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>('food')
  const [date, setDate] = useState(todayIso())

  const [name, setName] = useState('')
  const [dueDate, setDueDate] = useState(todayIso())

  const canSubmit = Number(amount) > 0 && (type === 'variable' || name.trim().length > 0)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    if (type === 'variable') {
      addVariableExpense({ amount: Number(amount), category, date })
    } else {
      addFixedExpense({ amount: Number(amount), name: name.trim(), dueDate, category })
    }
    navigate('/')
  }

  return (
    <div className="flex flex-col">
      <TopBar title="Log an expense" back />
      <div className="flex flex-col gap-4 px-4 py-5">
        <div className="flex rounded-xl bg-brand-50 p-1">
          <button
            type="button"
            onClick={() => setType('variable')}
            className={`flex-1 rounded-lg py-2 text-[14px] font-medium transition-colors ${
              type === 'variable' ? 'bg-surface-raised text-ink shadow-sm' : 'text-ink-secondary'
            }`}
          >
            Day-to-day
          </button>
          <button
            type="button"
            onClick={() => setType('fixed')}
            className={`flex-1 rounded-lg py-2 text-[14px] font-medium transition-colors ${
              type === 'fixed' ? 'bg-surface-raised text-ink shadow-sm' : 'text-ink-secondary'
            }`}
          >
            Fixed / upcoming
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field label="Amount">
            <input
              className={inputClasses}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>

          {type === 'fixed' && (
            <Field label="What is it?">
              <input
                className={inputClasses}
                type="text"
                placeholder="Tuition, rent, subscription…"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
          )}

          <Field label="Category">
            <select className={inputClasses} value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          {type === 'variable' ? (
            <Field label="Date spent">
              <input className={inputClasses} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
          ) : (
            <Field label="Due date">
              <input className={inputClasses} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </Field>
          )}

          {type === 'fixed' && (
            <p className="text-[13px] text-ink-muted -mt-1">
              We'll automatically set aside money for this as it comes in, based on how soon it's due.
            </p>
          )}

          <Button type="submit" disabled={!canSubmit} className="mt-1 w-full">
            Save expense
          </Button>
        </form>
      </div>
    </div>
  )
}
