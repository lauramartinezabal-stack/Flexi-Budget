export type Category = 'food' | 'transport' | 'leisure' | 'other'

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'food', label: 'Food' },
  { id: 'transport', label: 'Transport' },
  { id: 'leisure', label: 'Leisure' },
  { id: 'other', label: 'Other' },
]

export interface Income {
  id: string
  kind: 'income'
  amount: number
  source?: string
  date: string // ISO date (yyyy-MM-dd)
  note?: string
  createdAt: string
}

export interface VariableExpense {
  id: string
  kind: 'variable'
  amount: number
  category: Category
  date: string // ISO date (yyyy-MM-dd), date it was spent
  note?: string
  createdAt: string
}

export interface FixedExpense {
  id: string
  kind: 'fixed'
  amount: number
  name: string
  dueDate: string // ISO date (yyyy-MM-dd)
  category: Category
  paid: boolean
  createdAt: string
}

export type Entry = Income | VariableExpense | FixedExpense

export type NotificationType = 'weekly-summary' | 'monthly-alert'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  createdAt: string
  read: boolean
  // period this notification covers, ISO date
  periodStart?: string
  periodEnd?: string
  relatedExpenseId?: string
}

export interface AppState {
  entries: Entry[]
  notifications: AppNotification[]
  lastWeeklyNotificationWeekKey?: string
  lastMonthlyAlertCheck?: string
}
