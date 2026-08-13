import type { PropsWithChildren, ReactNode } from 'react'
import clsx from 'clsx'

export function Card({
  children,
  className,
  title,
  action,
}: PropsWithChildren<{ className?: string; title?: string; action?: ReactNode }>) {
  return (
    <section
      className={clsx(
        'rounded-2xl bg-white border border-sand-200/80 shadow-sm p-4',
        className,
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          {title && <h2 className="text-[15px] font-semibold text-brand-900">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
