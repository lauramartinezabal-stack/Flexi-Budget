# Flexi Budget

A personal finance app for students and people with irregular income. Instead of a fixed
monthly budget, Flexi Budget calculates a dynamic **weekly spendable amount** that
recalculates automatically whenever income arrives or a new fixed expense is added.

The core question it answers: **"How much can I safely spend this week without running
out?"**

## How the calculation works

1. Log income as it arrives — no fixed schedule assumed.
2. Log known fixed/upcoming expenses (tuition, rent, subscriptions, trips) with due dates.
3. The engine reserves money for those upcoming expenses based on how much balance is
   available versus how much is needed.
4. Whatever's left is spread across the weeks remaining until the next big due date,
   giving you a live "available this week" number.

See `src/lib/budget.ts` for the calculation engine.

## Features

- **Home dashboard** — the weekly spendable number, upcoming fixed expenses with
  reserved-amount progress, and a spending-by-category breakdown.
- **Add income / add expense flows** — quick entry for irregular income and both
  variable (day-to-day) and fixed (due-date) expenses.
- **Notifications** — a weekly recap of spending by category plus the new weekly
  number, and monthly alerts as fixed expenses approach.
- **History** — a filterable log of every income and expense entry.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Zustand, persisted to `localStorage` (no backend required for this MVP)
- Recharts for the category breakdown chart

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app is mobile-first — use your
browser's device toolbar for the intended layout.

## Not in v1

Bank syncing, multi-currency, investing, and social/sharing features are intentionally
out of scope for this prototype. All data is entered manually and stored locally in the
browser.
