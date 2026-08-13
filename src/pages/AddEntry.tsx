import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { todayISO } from '../lib/format'
import { CATEGORIES, type Category } from '../types'
import { PageHeader } from '../components/PageHeader'
import {
  AmountInput,
  Field,
  PrimaryButton,
  SegmentedControl,
  TextInput,
} from '../components/FormFields'

type EntryKind = 'income' | 'variable' | 'fixed' | 'savings'

const VALID_KINDS: EntryKind[] = ['income', 'variable', 'fixed', 'savings']

export default function AddEntry() {
  const [params] = useSearchParams()
  const preselect = params.get('type')
  const initialKind: EntryKind = VALID_KINDS.includes(preselect as EntryKind)
    ? (preselect as EntryKind)
    : 'income'

  const [kind, setKind] = useState<EntryKind>(initialKind)

  return (
    <div className="pb-8">
      <PageHeader title="Add" subtitle="Log income or an expense" />
      <div className="px-5 mt-1">
        <SegmentedControl
          value={kind}
          onChange={setKind}
          options={[
            { value: 'income', label: 'Income' },
            { value: 'variable', label: 'Spent' },
            { value: 'fixed', label: 'Bill' },
            { value: 'savings', label: 'Savings' },
          ]}
        />
        <div className="mt-5">
          {kind === 'income' && <IncomeForm />}
          {kind === 'variable' && <VariableForm />}
          {kind === 'fixed' && <FixedForm />}
          {kind === 'savings' && <SavingsForm />}
        </div>
      </div>
    </div>
  )
}

function IncomeForm() {
  const navigate = useNavigate()
  const addIncome = useAppStore((s) => s.addIncome)
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState('')
  const [date, setDate] = useState(todayISO())

  const canSubmit = Number(amount) > 0

  function submit() {
    if (!canSubmit) return
    addIncome({ amount: Number(amount), source: source.trim() || undefined, date })
    navigate('/')
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <Field label="Amount">
        <AmountInput value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
      </Field>
      <Field label="Source (optional)">
        <TextInput
          placeholder="Scholarship, family, freelance…"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
      </Field>
      <Field label="Date">
        <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayISO()} />
      </Field>
      <PrimaryButton type="submit" disabled={!canSubmit}>
        Add income
      </PrimaryButton>
    </form>
  )
}

function VariableForm() {
  const navigate = useNavigate()
  const addVariableExpense = useAppStore((s) => s.addVariableExpense)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>('food')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')

  const canSubmit = Number(amount) > 0

  function submit() {
    if (!canSubmit) return
    addVariableExpense({ amount: Number(amount), category, date, note: note.trim() || undefined })
    navigate('/')
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <Field label="Amount">
        <AmountInput value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
      </Field>
      <Field label="Category">
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`flex flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] font-semibold border transition-colors ${
                category === c.id
                  ? 'bg-brand-50 border-brand-400 text-brand-700'
                  : 'bg-white border-sand-200 text-gray-500'
              }`}
            >
              <span className="text-lg leading-none">{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Date">
        <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayISO()} />
      </Field>
      <Field label="Note (optional)">
        <TextInput placeholder="Coffee with friends" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <PrimaryButton type="submit" disabled={!canSubmit}>
        Log expense
      </PrimaryButton>
    </form>
  )
}

function FixedForm() {
  const navigate = useNavigate()
  const addFixedExpense = useAppStore((s) => s.addFixedExpense)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')

  const canSubmit = Number(amount) > 0 && name.trim().length > 0 && dueDate.length > 0

  function submit() {
    if (!canSubmit) return
    addFixedExpense({ name: name.trim(), amount: Number(amount), dueDate })
    navigate('/')
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <Field label="What's it for?">
        <TextInput placeholder="Tuition, rent, Netflix…" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </Field>
      <Field label="Amount">
        <AmountInput value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Field label="Due date">
        <TextInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} min={todayISO()} />
      </Field>
      <p className="text-[12px] text-gray-400 -mt-1">
        We'll set aside money for this automatically, prioritizing whichever bill is due soonest.
      </p>
      <PrimaryButton type="submit" disabled={!canSubmit}>
        Add upcoming bill
      </PrimaryButton>
    </form>
  )
}

function SavingsForm() {
  const navigate = useNavigate()
  const addSavingsGoal = useAppStore((s) => s.addSavingsGoal)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')

  const canSubmit = Number(amount) > 0 && name.trim().length > 0

  function submit() {
    if (!canSubmit) return
    addSavingsGoal({
      name: name.trim(),
      targetAmount: Number(amount),
      targetDate: targetDate || undefined,
    })
    navigate('/')
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <Field label="What are you saving for?">
        <TextInput
          placeholder="New laptop, trip home, emergency fund…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </Field>
      <Field label="Target amount">
        <AmountInput value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Field label="Target date (optional)">
        <TextInput type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} min={todayISO()} />
      </Field>
      <p className="text-[12px] text-gray-400 -mt-1">
        We'll set money aside for this once your bills are covered — bills always come first. Add
        a date to prioritize it over goals without one.
      </p>
      <PrimaryButton type="submit" disabled={!canSubmit}>
        Add savings goal
      </PrimaryButton>
    </form>
  )
}
