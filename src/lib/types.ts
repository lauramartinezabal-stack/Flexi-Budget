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
  amount: number;
  source?: string;
  date: string; // ISO date (yyyy-MM-dd)
  createdAt: string; // ISO datetime
}

export interface VariableExpense {
  id: string;
  kind: "variable";
  amount: number;
  category: Category;
  name?: string;
  date: string; // ISO date, when it was spent
  createdAt: string;
}

export interface FixedExpense {
  id: string;
  kind: "fixed";
  amount: number;
  name: string;
  dueDate: string; // ISO date
  createdAt: string;
}

export type ExpenseEntry = VariableExpense | FixedExpense;
