import { create } from "zustand";

type AddSheet = "closed" | "picker" | "income" | "variable-expense" | "fixed-expense";

interface UiState {
  addSheet: AddSheet;
  openPicker: () => void;
  openIncome: () => void;
  openVariableExpense: () => void;
  openFixedExpense: () => void;
  closeSheet: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  addSheet: "closed",
  openPicker: () => set({ addSheet: "picker" }),
  openIncome: () => set({ addSheet: "income" }),
  openVariableExpense: () => set({ addSheet: "variable-expense" }),
  openFixedExpense: () => set({ addSheet: "fixed-expense" }),
  closeSheet: () => set({ addSheet: "closed" }),
}));
