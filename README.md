# Flexi Budget

A personal finance app for students and people with irregular income. Instead of a fixed monthly
budget, it calculates a dynamic **weekly spendable amount** that recalculates automatically as
income arrives and fixed expenses are added or paid.

## How the budget number works

1. Log income whenever it arrives — no fixed schedule assumed.
2. Log upcoming fixed expenses (tuition, rent, subscriptions) with a due date.
3. The engine sets cash aside for whichever fixed expense is due soonest first, since it can't
   wait on future income arriving in time.
4. Whatever's left is spread evenly across the weeks remaining until the next fixed expense (or a
   default horizon, if nothing's due) to produce **"available this week."**

The number updates immediately whenever income, a fixed expense, or a logged purchase changes.

## Stack

Vite + React + TypeScript + Tailwind CSS v4, Zustand (persisted to `localStorage`), React Router,
Recharts. No backend — this is a client-only prototype; all data lives in the browser.

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # type-check + production build
```
