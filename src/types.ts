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
  kind: "income";
  amount: number;
  source?: string;
  date: string; // ISO yyyy-mm-dd
  note?: string;
  createdAt: string; // ISO timestamp
}

export interface VariableExpense {
  id: string;
  kind: "variable";
  amount: number;
  category: Category;
  date: string; // ISO yyyy-mm-dd
  note?: string;
  createdAt: string;
}

export interface FixedExpense {
  id: string;
  kind: "fixed";
  amount: number;
  label: string;
  dueDate: string; // ISO yyyy-mm-dd
  createdAt: string; // when it was logged — anchors the sinking-fund reserve
  paid: boolean;
  paidAt?: string;
}

export type Expense = VariableExpense | FixedExpense;

export type NotificationType = "weekly-summary" | "monthly-alert";

export interface AppNotification {
  id: string;
  type: NotificationType;
  createdAt: string; // ISO timestamp
  title: string;
  body: string;
  read: boolean;
  meta?: Record<string, unknown>;
}
