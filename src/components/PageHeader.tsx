import type { ReactNode } from 'react'

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="px-5 pt-6 pb-2 flex items-start justify-between">
      <div>
        <h1 className="text-xl font-semibold text-brand-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}
