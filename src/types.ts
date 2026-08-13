export type Category = "food" | "transport" | "leisure" | "other";

export const CATEGORIES: Category[] = ["food", "transport", "leisure", "other"];

export const CATEGORY_LABELS: Record<Category, string> = {
  food: "Food",
  transport: "Transport",
  leisure: "Leisure",
  other: "Other",
};

export interface Income {
  id: string;
  type: "income";
  amount: number;
  source?: string;
  date: string; // ISO date, day precision
  createdAt: string; // ISO datetime, logging order
}

export interface VariableExpense {
  id: string;
  type: "variable";
  amount: number;
  category: Category;
  description?: string;
  date: string;
  createdAt: string;
}

export interface FixedExpense {
  id: string;
  type: "fixed";
  amount: number;
  name: string;
  category: Category;
  dueDate: string; // ISO date
  createdAt: string;
  paid: boolean;
  paidDate?: string;
}

export type Expense = VariableExpense | FixedExpense;
export type Transaction = Income | Expense;
