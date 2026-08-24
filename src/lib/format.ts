import type { CurrencyCode } from '../types'

const formatterCache = new Map<string, Intl.NumberFormat>()

function getFormatter(currency: CurrencyCode, precise: boolean): Intl.NumberFormat {
  const key = `${currency}-${precise}`
  let formatter = formatterCache.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: precise ? 2 : 0,
    })
    formatterCache.set(key, formatter)
  }
  return formatter
}

export function formatCurrency(amount: number, currency: CurrencyCode, precise = false): string {
  return getFormatter(currency, precise).format(Number.isFinite(amount) ? amount : 0)
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
