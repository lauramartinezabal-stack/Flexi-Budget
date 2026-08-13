export type IncomeSource =
  | "scholarship"
  | "family"
  | "job"
  | "freelance"
  | "other";

export const INCOME_SOURCES: { value: IncomeSource; label: string }[] = [
  { value: "scholarship", label: "Scholarship" },
  { value: "family", label: "Family support" },
  { value: "job", label: "Part-time job" },
  { value: "freelance", label: "Freelance" },
  { value: "other", label: "Other" },
];

export type ExpenseCategory = "food" | "transport" | "leisure" | "other";

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] =
  [
    { value: "food", label: "Food" },
    { value: "transport", label: "Transport" },
    { value: "leisure", label: "Leisure" },
    { value: "other", label: "Other" },
  ];

export interface IncomeEntry {
  id: string;
  kind: "income";
  amount: number;
  source?: IncomeSource;
  note?: string;
  date: string; // ISO date (yyyy-mm-dd)
  createdAt: string; // ISO datetime
}

export interface VariableExpense {
  id: string;
  kind: "variable";
  amount: number;
  category: ExpenseCategory;
  note?: string;
  date: string; // ISO date
  createdAt: string;
}

export interface FixedExpense {
  id: string;
  kind: "fixed";
  amount: number;
  name: string;
  dueDate: string; // ISO date
  paid: boolean;
  createdAt: string;
}

export type ExpenseEntry = VariableExpense | FixedExpense;
