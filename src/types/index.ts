export type Category = "food" | "transport" | "leisure" | "other";

export const CATEGORIES: Category[] = ["food", "transport", "leisure", "other"];

export const CATEGORY_LABELS: Record<Category, string> = {
  food: "Food",
  transport: "Transport",
  leisure: "Leisure",
  other: "Other",
};

export interface IncomeEntry {
  id: string;
  type: "income";
  amount: number;
  source?: string;
  date: string; // ISO date (yyyy-MM-dd)
  createdAt: string; // ISO timestamp, for ordering same-day entries
}

export interface VariableExpense {
  id: string;
  type: "variable";
  amount: number;
  category: Category;
  note?: string;
  date: string; // ISO date, when it was spent
  createdAt: string;
}

export interface FixedExpense {
  id: string;
  type: "fixed";
  name: string;
  amount: number;
  dueDate: string; // ISO date
  paid: boolean;
  createdAt: string;
}

export type Entry = IncomeEntry | VariableExpense | FixedExpense;

export interface NotificationItem {
  id: string;
  kind: "weekly-summary" | "fixed-expense-approaching";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  meta?: Record<string, string | number>;
}

export interface AppState {
  income: IncomeEntry[];
  variableExpenses: VariableExpense[];
  fixedExpenses: FixedExpense[];
  notifications: NotificationItem[];
  lastWeeklySummaryWeekKey?: string;
}
