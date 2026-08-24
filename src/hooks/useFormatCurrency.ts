import { useCallback, useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { formatCurrency } from '../lib/format'
import { CURRENCIES } from '../types'

export function useFormatCurrency() {
  const currency = useAppStore((s) => s.settings.currency)
  const format = useCallback(
    (amount: number, precise = false) => formatCurrency(amount, currency, precise),
    [currency],
  )
  const symbol = useMemo(
    () => CURRENCIES.find((c) => c.code === currency)?.symbol ?? '€',
    [currency],
  )
  return { format, currency, symbol }
}
