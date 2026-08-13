import clsx from 'clsx'

export function ProgressBar({
  progress,
  className,
  colorClassName = 'bg-brand-400',
}: {
  progress: number
  className?: string
  colorClassName?: string
}) {
  const pct = Math.min(100, Math.max(0, progress * 100))
  return (
    <div className={clsx('h-2 w-full rounded-full bg-sand-200 overflow-hidden', className)}>
      <div
        className={clsx('h-full rounded-full transition-all duration-500', colorClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
