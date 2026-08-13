import { CATEGORIES, type Category } from '../lib/types'
import { formatMoney } from '../lib/format'

const categoryColorVar: Record<Category, string> = {
  food: 'var(--color-cat-food)',
  transport: 'var(--color-cat-transport)',
  leisure: 'var(--color-cat-leisure)',
  other: 'var(--color-cat-other)',
}

export function CategoryBreakdown({ totals }: { totals: { category: Category; total: number }[] }) {
  const max = Math.max(1, ...totals.map((t) => t.total))
  const grandTotal = totals.reduce((sum, t) => sum + t.total, 0)

  if (grandTotal === 0) {
    return <p className="text-[14px] text-ink-muted py-2">No spending logged yet this period.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {totals.map((t) => {
        const label = CATEGORIES.find((c) => c.id === t.category)?.label ?? t.category
        const widthPct = (t.total / max) * 100
        return (
          <div key={t.category} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[14px]">
              <span className="flex items-center gap-2 text-ink">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: categoryColorVar[t.category] }}
                  aria-hidden
                />
                {label}
              </span>
              <span className="font-medium text-ink tabular-nums">{formatMoney(t.total)}</span>
            </div>
            <div className="h-2 rounded-full bg-brand-50 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(4, widthPct)}%`, background: categoryColorVar[t.category] }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
