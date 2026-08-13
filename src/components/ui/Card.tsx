import type { HTMLAttributes, ReactNode } from 'react'

export function Card({
  children,
  className = '',
  ...rest
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl bg-surface-raised border border-border p-4 shadow-[0_1px_2px_rgba(23,35,31,0.04)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
