import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import type { AppState, Category, FixedExpense, IncomeEntry, NotificationItem, VariableExpense } from "../types";
import { makeId } from "../lib/id";
import { buildFixedExpenseAlerts, buildWeeklySummaryNotification } from "../lib/notifications";

const STORAGE_KEY = "flexi-budget:state:v1";

const emptyState: AppState = {
  income: [],
  variableExpenses: [],
  fixedExpenses: [],
  notifications: [],
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw);
    return { ...emptyState, ...parsed };
  } catch {
    return emptyState;
  }
}

type Action =
  | { type: "ADD_INCOME"; payload: { amount: number; source?: string; date: string } }
  | { type: "ADD_VARIABLE_EXPENSE"; payload: { amount: number; category: Category; note?: string; date: string } }
  | { type: "ADD_FIXED_EXPENSE"; payload: { name: string; amount: number; dueDate: string } }
  | { type: "MARK_FIXED_PAID"; payload: { id: string; paid: boolean } }
  | { type: "DELETE_ENTRY"; payload: { id: string; entryType: "income" | "variable" | "fixed" } }
  | { type: "MARK_NOTIFICATION_READ"; payload: { id: string } }
  | { type: "MARK_ALL_NOTIFICATIONS_READ" }
  | { type: "SYNC_NOTIFICATIONS"; payload: { notifications: NotificationItem[]; weekKey?: string } };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "ADD_INCOME": {
      const entry: IncomeEntry = {
        id: makeId(),
        type: "income",
        createdAt: new Date().toISOString(),
        ...action.payload,
      };
      return { ...state, income: [...state.income, entry] };
    }
    case "ADD_VARIABLE_EXPENSE": {
      const entry: VariableExpense = {
        id: makeId(),
        type: "variable",
        createdAt: new Date().toISOString(),
        ...action.payload,
      };
      return { ...state, variableExpenses: [...state.variableExpenses, entry] };
    }
    case "ADD_FIXED_EXPENSE": {
      const entry: FixedExpense = {
        id: makeId(),
        type: "fixed",
        paid: false,
        createdAt: new Date().toISOString(),
        ...action.payload,
      };
      return { ...state, fixedExpenses: [...state.fixedExpenses, entry] };
    }
    case "MARK_FIXED_PAID": {
      return {
        ...state,
        fixedExpenses: state.fixedExpenses.map((e) =>
          e.id === action.payload.id ? { ...e, paid: action.payload.paid } : e
        ),
      };
    }
    case "DELETE_ENTRY": {
      const { id, entryType } = action.payload;
      if (entryType === "income") return { ...state, income: state.income.filter((e) => e.id !== id) };
      if (entryType === "variable")
        return { ...state, variableExpenses: state.variableExpenses.filter((e) => e.id !== id) };
      return { ...state, fixedExpenses: state.fixedExpenses.filter((e) => e.id !== id) };
    }
    case "MARK_NOTIFICATION_READ": {
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload.id ? { ...n, read: true } : n
        ),
      };
    }
    case "MARK_ALL_NOTIFICATIONS_READ": {
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };
    }
    case "SYNC_NOTIFICATIONS": {
      if (action.payload.notifications.length === 0 && !action.payload.weekKey) return state;
      return {
        ...state,
        notifications: [...action.payload.notifications, ...state.notifications],
        lastWeeklySummaryWeekKey: action.payload.weekKey ?? state.lastWeeklySummaryWeekKey,
      };
    }
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Weekly summary only needs checking once per load: it reacts to elapsed time, not edits.
  useEffect(() => {
    const { notification, weekKey } = buildWeeklySummaryNotification(state, new Date());
    const weekKeyChanged = weekKey !== state.lastWeeklySummaryWeekKey;
    if (notification || weekKeyChanged) {
      dispatch({
        type: "SYNC_NOTIFICATIONS",
        payload: { notifications: notification ? [notification] : [], weekKey },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fixed-expense alerts are deduped by expense id, so it's safe to re-scan whenever
  // the fixed expense list changes (e.g. a new one is added mid-session).
  useEffect(() => {
    const fixedAlerts = buildFixedExpenseAlerts(state, new Date());
    if (fixedAlerts.length > 0) {
      dispatch({ type: "SYNC_NOTIFICATIONS", payload: { notifications: fixedAlerts } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.fixedExpenses]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
