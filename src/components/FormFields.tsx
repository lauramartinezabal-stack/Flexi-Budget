import type { InputHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-gray-600 mb-1.5">{label}</span>
      {children}
    </label>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        'w-full rounded-xl border border-sand-200 bg-white px-3.5 py-2.5 text-[15px] text-brand-900 outline-none transition-colors',
        'focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
        'placeholder:text-gray-300',
        props.className,
      )}
    />
  )
}

export function AmountInput({
  symbol = '€',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { symbol?: string }) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[22px] font-semibold text-brand-300">
        {symbol}
      </span>
      <input
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        placeholder="0.00"
        {...props}
        className={clsx(
          'w-full rounded-xl border border-sand-200 bg-white pl-9 pr-3.5 py-3 text-[26px] font-semibold text-brand-900 outline-none transition-colors',
          'focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
          'placeholder:text-sand-300',
          props.className,
        )}
      />
    </div>
  )
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex p-1 rounded-xl bg-sand-100 gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={clsx(
            'flex-1 py-2 rounded-lg text-[13px] font-semibold transition-colors',
            value === opt.value
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-gray-500 hover:text-brand-600',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between py-1"
    >
      <span className="text-[14px] font-medium text-brand-900">{label}</span>
      <span
        className={clsx(
          'relative w-11 h-6 rounded-full transition-colors shrink-0',
          checked ? 'bg-brand-500' : 'bg-sand-200',
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </span>
    </button>
  )
}

export function RecurrenceFields({
  repeats,
  onRepeatsChange,
  hasEndDate,
  onHasEndDateChange,
  endDate,
  onEndDateChange,
  minEndDate,
  label = 'Repeats every month',
}: {
  repeats: boolean
  onRepeatsChange: (v: boolean) => void
  hasEndDate: boolean
  onHasEndDateChange: (v: boolean) => void
  endDate: string
  onEndDateChange: (v: string) => void
  minEndDate?: string
  label?: string
}) {
  return (
    <div className="rounded-xl border border-sand-200 bg-white px-3.5 py-2.5">
      <Toggle checked={repeats} onChange={onRepeatsChange} label={label} />
      {repeats && (
        <div className="mt-3 pt-3 border-t border-sand-100 space-y-2">
          <SegmentedControl
            value={hasEndDate ? 'until' : 'indefinite'}
            onChange={(v) => onHasEndDateChange(v === 'until')}
            options={[
              { value: 'indefinite', label: 'No end date' },
              { value: 'until', label: 'Ends on a date' },
            ]}
          />
          {hasEndDate && (
            <TextInput
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              min={minEndDate}
            />
          )}
        </div>
      )}
    </div>
  )
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={clsx(
        'w-full rounded-xl bg-brand-500 text-white font-semibold py-3.5 text-[15px] transition-colors',
        'hover:bg-brand-600 active:bg-brand-700 disabled:opacity-40 disabled:pointer-events-none',
        props.className,
      )}
    />
  )
}
