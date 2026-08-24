export type Category = 'food' | 'transport' | 'leisure' | 'other'

export const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'food', label: 'Food', icon: '🍜' },
  { id: 'transport', label: 'Transport', icon: '🚌' },
  { id: 'leisure', label: 'Leisure', icon: '🎬' },
  { id: 'other', label: 'Other', icon: '🧾' },
]

export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'MXN' | 'ARS' | 'COP'

export const CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'MXN', label: 'Mexican Peso', symbol: '$' },
  { code: 'ARS', label: 'Argentine Peso', symbol: '$' },
  { code: 'COP', label: 'Colombian Peso', symbol: '$' },
]

/** Only monthly recurrence is supported for now — covers scholarships, rent, subscriptions. */
export interface RecurrenceRule {
  frequency: 'monthly'
  /** ISO date; undefined means it repeats indefinitely */
  endDate?: string
}

export interface IncomeEntry {
  id: string
  amount: number
  source?: string
  date: string // ISO date (yyyy-MM-dd) — the start date when recurring is set
  createdAt: string // ISO timestamp
  recurring?: RecurrenceRule
}

export interface FixedExpense {
  id: string
  name: string
  amount: number
  dueDate: string // ISO date — current/next due date; advances a month at a time when recurring
  createdAt: string // ISO timestamp
  paid: boolean
  recurring?: RecurrenceRule
  /** cumulative amount paid across past cycles of a recurring bill */
  totalPaidToDate: number
}

export interface SavingsGoal {
  id: string
  name: string
  createdAt: string // ISO timestamp
  achieved: boolean
  // A goal is either a one-off target amount, or a recurring monthly
  // contribution fund that grows over time — never both.
  /** one-off target amount, e.g. "New laptop, €500" */
  targetAmount?: number
  /** optional deadline for a one-off target */
  targetDate?: string
  /** recurring fund contribution per month, e.g. "Emergency fund, €50/month" */
  monthlyContribution?: number
  /** anchor date contributions start counting from (required if monthlyContribution is set) */
  startDate?: string
  /** optional end date for the recurring contribution; undefined = indefinite */
  endDate?: string
}

export interface VariableExpense {
  id: string
  amount: number
  category: Category
  date: string // ISO date (yyyy-MM-dd)
  note?: string
  createdAt: string // ISO timestamp
}

export interface Settings {
  /** Default number of weeks to spread free balance over when no fixed expense is upcoming */
  defaultHorizonWeeks: number
  /** ISO 4217 currency code used to display and enter all amounts */
  currency: CurrencyCode
  /** Last time notifications were generated, to avoid duplicate weekly/monthly notices */
  lastWeeklyNotificationAt?: string
  lastMonthlyCheckAt?: string
}

export type NotificationKind = 'weekly-summary' | 'fixed-expense-approaching'

export interface AppNotification {
  id: string
  kind: NotificationKind
  createdAt: string
  title: string
  body: string
  read: boolean
}
