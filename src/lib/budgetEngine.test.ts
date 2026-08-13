import { describe, expect, it } from "vitest";
import type { FixedExpense, Income, VariableExpense } from "../types";
import {
  computeBudgetSnapshot,
  computeCategoryBreakdown,
  computeNetBalance,
  computeReservations,
  computeWeeklyAvailable,
  generateApproachingAlerts,
  sortUnpaidFixedExpenses,
} from "./budgetEngine";

const TODAY = new Date("2026-08-13T12:00:00Z");

function income(amount: number, date: string): Income {
  return { id: crypto.randomUUID(), type: "income", amount, date, createdAt: date };
}

function variable(amount: number, category: VariableExpense["category"], date: string): VariableExpense {
  return { id: crypto.randomUUID(), type: "variable", amount, category, date, createdAt: date };
}

function fixed(
  amount: number,
  dueDate: string,
  overrides: Partial<FixedExpense> = {},
): FixedExpense {
  return {
    id: crypto.randomUUID(),
    type: "fixed",
    amount,
    name: "Bill",
    category: "other",
    dueDate,
    createdAt: "2026-08-01",
    paid: false,
    ...overrides,
  };
}

describe("computeNetBalance", () => {
  it("sums income minus variable spend minus paid fixed expenses", () => {
    const incomes = [income(100, "2026-08-01"), income(50, "2026-08-05")];
    const variables = [variable(20, "food", "2026-08-02")];
    const fixedExpenses = [fixed(30, "2026-08-10", { paid: true }), fixed(40, "2026-09-01")];
    expect(computeNetBalance(incomes, variables, fixedExpenses)).toBe(100 + 50 - 20 - 30);
  });
});

describe("computeReservations", () => {
  it("fully funds the soonest bill before touching later ones", () => {
    const unpaid = sortUnpaidFixedExpenses([
      fixed(50, "2026-09-01", { name: "Later" }),
      fixed(30, "2026-08-20", { name: "Soonest" }),
    ]);
    const { reservations, freeBalance, totalShortfall } = computeReservations(60, unpaid);
    expect(reservations[0].expense.name).toBe("Soonest");
    expect(reservations[0].reserved).toBe(30);
    expect(reservations[1].reserved).toBe(30);
    expect(reservations[1].stillNeeded).toBe(20);
    expect(freeBalance).toBe(0);
    expect(totalShortfall).toBe(20);
  });

  it("leaves a free balance once all bills are fully covered", () => {
    const unpaid = sortUnpaidFixedExpenses([fixed(30, "2026-08-20")]);
    const { freeBalance, totalShortfall } = computeReservations(100, unpaid);
    expect(freeBalance).toBe(70);
    expect(totalShortfall).toBe(0);
  });

  it("never reserves a negative amount when balance is already negative", () => {
    const unpaid = sortUnpaidFixedExpenses([fixed(30, "2026-08-20")]);
    const { reservations, freeBalance } = computeReservations(-10, unpaid);
    expect(reservations[0].reserved).toBe(0);
    expect(freeBalance).toBe(0);
  });
});

describe("computeWeeklyAvailable", () => {
  it("spreads free balance across weeks until the nearest bill", () => {
    const unpaid = sortUnpaidFixedExpenses([fixed(0, "2026-08-27")]); // 14 days out from TODAY
    const { weeklyAvailable, horizonWeeks } = computeWeeklyAvailable(140, unpaid, TODAY);
    expect(horizonWeeks).toBe(2);
    expect(weeklyAvailable).toBe(70);
  });

  it("falls back to the default smoothing horizon with no upcoming bills", () => {
    const { weeklyAvailable, horizonWeeks } = computeWeeklyAvailable(200, [], TODAY, 4);
    expect(horizonWeeks).toBe(4);
    expect(weeklyAvailable).toBe(50);
  });

  it("never divides by fewer than one week for a bill due very soon", () => {
    const unpaid = sortUnpaidFixedExpenses([fixed(0, "2026-08-14")]); // tomorrow
    const { horizonWeeks } = computeWeeklyAvailable(70, unpaid, TODAY);
    expect(horizonWeeks).toBe(1);
  });
});

describe("computeCategoryBreakdown", () => {
  it("totals and percentages per category within a range", () => {
    const variables = [
      variable(30, "food", "2026-08-10"),
      variable(10, "transport", "2026-08-11"),
      variable(60, "food", "2026-07-01"), // outside range
    ];
    const breakdown = computeCategoryBreakdown(variables, {
      from: new Date("2026-08-01"),
      to: new Date("2026-08-13"),
    });
    const food = breakdown.find((c) => c.category === "food")!;
    const transport = breakdown.find((c) => c.category === "transport")!;
    expect(food.total).toBe(30);
    expect(transport.total).toBe(10);
    expect(food.percent).toBeCloseTo(75);
    expect(transport.percent).toBeCloseTo(25);
  });
});

describe("generateApproachingAlerts", () => {
  it("includes only bills within the threshold, soonest first", () => {
    const unpaid = sortUnpaidFixedExpenses([
      fixed(10, "2026-09-20", { name: "Far" }),
      fixed(10, "2026-08-25", { name: "Near" }),
    ]);
    const { reservations } = computeReservations(1000, unpaid);
    const alerts = generateApproachingAlerts(reservations, TODAY, 30);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].expense.name).toBe("Near");
  });
});

describe("computeBudgetSnapshot", () => {
  it("composes the full pipeline consistently", () => {
    const incomes = [income(300, "2026-08-01")];
    const variables = [variable(20, "food", "2026-08-05")];
    const fixedExpenses = [fixed(100, "2026-08-27")]; // 14 days out
    const snapshot = computeBudgetSnapshot(incomes, variables, fixedExpenses, TODAY);
    expect(snapshot.netBalance).toBe(280);
    expect(snapshot.reservationResult.freeBalance).toBe(180);
    expect(snapshot.horizonWeeks).toBe(2);
    expect(snapshot.weeklyAvailable).toBe(90);
  });
});
