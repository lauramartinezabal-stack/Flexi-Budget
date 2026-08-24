import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { todayISO } from '../lib/format'
import { useFormatCurrency } from '../hooks/useFormatCurrency'
import { CATEGORIES, type Category } from '../types'
import { PageHeader } from '../components/PageHeader'
import {
  AmountInput,
  Field,
  PrimaryButton,
  RecurrenceFields,
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
  const { symbol } = useFormatCurrency()
  const addIncome = useAppStore((s) => s.addIncome)
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState('')
  const [date, setDate] = useState(todayISO())
  const [repeats, setRepeats] = useState(false)
  const [hasEndDate, setHasEndDate] = useState(false)
  const [endDate, setEndDate] = useState('')

  const canSubmit = Number(amount) > 0 && (!repeats || !hasEndDate || endDate.length > 0)

  function submit() {
    if (!canSubmit) return
    addIncome({
      amount: Number(amount),
      source: source.trim() || undefined,
      date,
      recurring: repeats
        ? { frequency: 'monthly', endDate: hasEndDate ? endDate : undefined }
        : undefined,
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
      <Field label="Amount">
        <AmountInput symbol={symbol} value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
      </Field>
      <Field label="Source (optional)">
        <TextInput
          placeholder="Scholarship, family, freelance…"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
      </Field>
      <Field label={repeats ? 'Start date' : 'Date'}>
        <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayISO()} />
      </Field>
      <RecurrenceFields
        label="Repeats every month"
        repeats={repeats}
        onRepeatsChange={setRepeats}
        hasEndDate={hasEndDate}
        onHasEndDateChange={setHasEndDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        minEndDate={date}
      />
      {repeats && (
        <p className="text-[12px] text-gray-400 -mt-1">
          We'll count this every month from the start date automatically — no need to log it again.
        </p>
      )}
      <PrimaryButton type="submit" disabled={!canSubmit}>
        Add income
      </PrimaryButton>
    </form>
  )
}

function VariableForm() {
  const navigate = useNavigate()
  const { symbol } = useFormatCurrency()
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
        <AmountInput symbol={symbol} value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
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
  const { symbol } = useFormatCurrency()
  const addFixedExpense = useAppStore((s) => s.addFixedExpense)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [repeats, setRepeats] = useState(false)
  const [hasEndDate, setHasEndDate] = useState(false)
  const [endDate, setEndDate] = useState('')

  const canSubmit =
    Number(amount) > 0 &&
    name.trim().length > 0 &&
    dueDate.length > 0 &&
    (!repeats || !hasEndDate || endDate.length > 0)

  function submit() {
    if (!canSubmit) return
    addFixedExpense({
      name: name.trim(),
      amount: Number(amount),
      dueDate,
      recurring: repeats
        ? { frequency: 'monthly', endDate: hasEndDate ? endDate : undefined }
        : undefined,
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
      <Field label="What's it for?">
        <TextInput placeholder="Tuition, rent, Netflix…" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </Field>
      <Field label="Amount">
        <AmountInput symbol={symbol} value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Field label={repeats ? 'First due date' : 'Due date'}>
        <TextInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} min={todayISO()} />
      </Field>
      <RecurrenceFields
        label="Repeats every month"
        repeats={repeats}
        onRepeatsChange={setRepeats}
        hasEndDate={hasEndDate}
        onHasEndDateChange={setHasEndDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        minEndDate={dueDate || todayISO()}
      />
      <p className="text-[12px] text-gray-400 -mt-1">
        We'll set aside money for this automatically, prioritizing whichever bill is due soonest.
        {repeats && ' Once you mark a cycle paid, the next month is scheduled automatically.'}
      </p>
      <PrimaryButton type="submit" disabled={!canSubmit}>
        {repeats ? 'Add monthly bill' : 'Add upcoming bill'}
      </PrimaryButton>
    </form>
  )
}

type SavingsMode = 'goal' | 'fund'

function SavingsForm() {
  const [mode, setMode] = useState<SavingsMode>('goal')

  return (
    <div className="space-y-4">
      <SegmentedControl
        value={mode}
        onChange={setMode}
        options={[
          { value: 'goal', label: 'One-off goal' },
          { value: 'fund', label: 'Monthly fund' },
        ]}
      />
      {mode === 'goal' ? <SavingsGoalForm /> : <SavingsFundForm />}
    </div>
  )
}

function SavingsGoalForm() {
  const navigate = useNavigate()
  const { symbol } = useFormatCurrency()
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
          placeholder="New laptop, trip home, new bag…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </Field>
      <Field label="Target amount">
        <AmountInput symbol={symbol} value={amount} onChange={(e) => setAmount(e.target.value)} />
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

function SavingsFundForm() {
  const navigate = useNavigate()
  const { symbol } = useFormatCurrency()
  const addSavingsGoal = useAppStore((s) => s.addSavingsGoal)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [startDate, setStartDate] = useState(todayISO())
  const [hasEndDate, setHasEndDate] = useState(false)
  const [endDate, setEndDate] = useState('')

  const canSubmit = Number(amount) > 0 && name.trim().length > 0 && (!hasEndDate || endDate.length > 0)

  function submit() {
    if (!canSubmit) return
    addSavingsGoal({
      name: name.trim(),
      monthlyContribution: Number(amount),
      startDate,
      endDate: hasEndDate ? endDate : undefined,
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
      <Field label="Fund name">
        <TextInput
          placeholder="Emergency fund, general savings…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </Field>
      <Field label="Amount per month">
        <AmountInput symbol={symbol} value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Field label="Start date">
        <TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} max={todayISO()} />
      </Field>
      <div className="rounded-xl border border-sand-200 bg-white px-3.5 py-2.5 space-y-2">
        <span className="block text-[14px] font-medium text-brand-900">Ends</span>
        <SegmentedControl
          value={hasEndDate ? 'until' : 'indefinite'}
          onChange={(v) => setHasEndDate(v === 'until')}
          options={[
            { value: 'indefinite', label: 'Never — ongoing' },
            { value: 'until', label: 'On a date' },
          ]}
        />
        {hasEndDate && (
          <TextInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
        )}
      </div>
      <p className="text-[12px] text-gray-400 -mt-1">
        We'll grow this fund by that amount every month, gradually, out of whatever's left after
        your bills — no fixed target, so it never "completes." Close it any time.
      </p>
      <PrimaryButton type="submit" disabled={!canSubmit}>
        Add monthly fund
      </PrimaryButton>
    </form>
  )
}
