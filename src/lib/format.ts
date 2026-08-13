const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const currencyFormatterPrecise = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

export function formatCurrency(amount: number, precise = false): string {
  const formatter = precise ? currencyFormatterPrecise : currencyFormatter
  return formatter.format(Number.isFinite(amount) ? amount : 0)
}

export function formatDateHuman(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''))
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''))
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}
