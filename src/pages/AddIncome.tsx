import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import { Field, inputClasses } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { useApp } from '../state/AppContext'
import { todayIso } from '../lib/format'

export function AddIncome() {
  const { addIncome } = useApp()
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState('')
  const [date, setDate] = useState(todayIso())

  const canSubmit = Number(amount) > 0

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    addIncome({ amount: Number(amount), source: source.trim() || undefined, date })
    navigate('/')
  }

  return (
    <div className="flex flex-col">
      <TopBar title="Log income" back />
      <form onSubmit={onSubmit} className="flex flex-col gap-4 px-4 py-5">
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
            autoFocus
          />
        </Field>
        <Field label="Source (optional)">
          <input
            className={inputClasses}
            type="text"
            placeholder="Scholarship, family, job…"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        </Field>
        <Field label="Date received">
          <input className={inputClasses} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Button type="submit" disabled={!canSubmit} className="mt-2 w-full">
          Save income
        </Button>
      </form>
    </div>
  )
}
