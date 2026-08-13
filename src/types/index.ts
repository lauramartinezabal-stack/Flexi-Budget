export type Category = 'food' | 'transport' | 'leisure' | 'other'

export const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'food', label: 'Food', icon: '🍜' },
  { id: 'transport', label: 'Transport', icon: '🚌' },
  { id: 'leisure', label: 'Leisure', icon: '🎬' },
  { id: 'other', label: 'Other', icon: '🧾' },
]

export interface IncomeEntry {
  id: string
  amount: number
  source?: string
  date: string // ISO date (yyyy-MM-dd)
  createdAt: string // ISO timestamp
}

export interface FixedExpense {
  id: string
  name: string
  amount: number
  dueDate: string // ISO date (yyyy-MM-dd)
  createdAt: string // ISO timestamp, start of the reservation ramp
  paid: boolean
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  targetDate?: string // ISO date (yyyy-MM-dd), optional
  createdAt: string // ISO timestamp
  achieved: boolean
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
