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

export function AmountInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[22px] font-semibold text-brand-300">
        $
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
