import { describe, expect, it } from 'vitest'
import {
  categoryTotals,
  computeReservations,
  computeWeeklyBudget,
  currentBalance,
  freeBalance,
  weeksOfRunway,
} from './engine'
import type { Entry, FixedExpense, Income, VariableExpense } from './types'

function income(amount: number, date: string): Income {
  return { id: crypto.randomUUID(), kind: 'income', amount, date, createdAt: date }
}

function variable(amount: number, category: VariableExpense['category'], date: string): VariableExpense {
  return { id: crypto.randomUUID(), kind: 'variable', amount, category, date, createdAt: date }
}

function fixed(amount: number, name: string, dueDate: string, paid = false): FixedExpense {
  return {
    id: crypto.randomUUID(),
    kind: 'fixed',
    amount,
    name,
    dueDate,
    category: 'other',
    paid,
    createdAt: dueDate,
  }
}

describe('currentBalance', () => {
  it('sums income minus variable spending minus paid fixed expenses', () => {
    const entries: Entry[] = [
      income(500, '2026-08-01'),
      variable(50, 'food', '2026-08-02'),
      fixed(100, 'Gym', '2026-08-10', true),
    ]
    expect(currentBalance(entries)).toBe(350)
  })

  it('does not subtract unpaid fixed expenses', () => {
    const entries: Entry[] = [income(500, '2026-08-01'), fixed(100, 'Rent', '2026-09-01')]
    expect(currentBalance(entries)).toBe(500)
  })
})

describe('computeReservations', () => {
  it('reserves for the soonest due date first', () => {
    const entries: Entry[] = [
      income(300, '2026-08-01'),
      fixed(200, 'Rent', '2026-08-15'),
      fixed(200, 'Tuition', '2026-09-01'),
    ]
    const { reservations, totalReserved } = computeReservations(entries)
    expect(reservations[0].expense.name).toBe('Rent')
    expect(reservations[0].reserved).toBe(200)
    expect(reservations[1].expense.name).toBe('Tuition')
    expect(reservations[1].reserved).toBe(100)
    expect(reservations[1].stillNeeded).toBe(100)
    expect(totalReserved).toBe(300)
  })

  it('never reserves more than the current balance', () => {
    const entries: Entry[] = [income(50, '2026-08-01'), fixed(200, 'Rent', '2026-08-15')]
    const { totalReserved } = computeReservations(entries)
    expect(totalReserved).toBe(50)
  })
})

describe('freeBalance', () => {
  it('is balance minus everything reserved', () => {
    const entries: Entry[] = [income(500, '2026-08-01'), fixed(200, 'Rent', '2026-08-15')]
    expect(freeBalance(entries)).toBe(300)
  })

  it('never goes negative', () => {
    const entries: Entry[] = [income(100, '2026-08-01'), fixed(200, 'Rent', '2026-08-15')]
    expect(freeBalance(entries)).toBe(0)
  })
})

describe('weeksOfRunway', () => {
  it('defaults to 4 weeks with no upcoming fixed expenses', () => {
    expect(weeksOfRunway([], new Date('2026-08-13'))).toBe(4)
  })

  it('derives weeks from the nearest due date', () => {
    const entries: Entry[] = [fixed(100, 'Rent', '2026-08-27')]
    // Aug 13 -> Aug 27 is 14 days -> 2 weeks
    expect(weeksOfRunway(entries, new Date('2026-08-13'))).toBe(2)
  })

  it('floors at 1 week when the due date is imminent or past', () => {
    const entries: Entry[] = [fixed(100, 'Rent', '2026-08-13')]
    expect(weeksOfRunway(entries, new Date('2026-08-13'))).toBe(1)
  })
})

describe('computeWeeklyBudget', () => {
  it('splits the free balance across the runway and subtracts this week spending', () => {
    const today = new Date('2026-08-13') // Thursday
    const entries: Entry[] = [
      income(280, '2026-08-01'),
      fixed(0, 'placeholder', '2026-08-27'), // 2-week runway, $0 to reserve
      variable(20, 'food', '2026-08-12'), // within this Mon-Sun week
    ]
    const budget = computeWeeklyBudget(entries, today)
    expect(budget.weeks).toBe(2)
    // free balance = 280 income - 20 already spent = 260, split over 2 weeks = 130
    expect(budget.weeklyAllowance).toBe(130)
    expect(budget.spentThisWeek).toBe(20)
    expect(budget.availableThisWeek).toBe(110)
  })

  it('floors availableThisWeek at 0 when overspent', () => {
    const today = new Date('2026-08-13')
    const entries: Entry[] = [income(70, '2026-08-01'), variable(100, 'food', '2026-08-12')]
    const budget = computeWeeklyBudget(entries, today)
    expect(budget.availableThisWeek).toBe(0)
  })
})

describe('categoryTotals', () => {
  it('sums variable spending per category within a window, ignoring income and fixed', () => {
    const entries: Entry[] = [
      variable(10, 'food', '2026-08-12'),
      variable(5, 'food', '2026-08-13'),
      variable(8, 'transport', '2026-08-12'),
      income(100, '2026-08-12'),
      fixed(50, 'Rent', '2026-08-12'),
    ]
    const totals = categoryTotals(entries, new Date('2026-08-11'), new Date('2026-08-17'))
    const food = totals.find((t) => t.category === 'food')
    const transport = totals.find((t) => t.category === 'transport')
    expect(food?.total).toBe(15)
    expect(transport?.total).toBe(8)
  })
})
