import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white active:bg-brand-600',
  secondary: 'bg-brand-50 text-brand-700 active:bg-brand-100',
  ghost: 'bg-transparent text-ink-secondary active:bg-brand-50',
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...rest
}: { children: ReactNode; variant?: Variant } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[15px] font-medium transition-colors disabled:opacity-40 ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
