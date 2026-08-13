import type { ReactNode } from 'react'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-ink-secondary">{label}</span>
      {children}
    </label>
  )
}

export const inputClasses =
  'w-full rounded-xl border border-border bg-surface-raised px-3.5 py-3 text-[16px] text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
