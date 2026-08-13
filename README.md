# Flexi Budget

A budgeting app for students and people with irregular income. Instead of splitting a
fixed monthly salary into four weeks, Flexi Budget recalculates a **dynamic weekly
spendable amount** every time income arrives or a new fixed expense is added — so the
app can always answer: *"How much can I safely spend this week?"*

## How the numbers work

1. Log income as it arrives — no fixed schedule assumed.
2. Log known upcoming fixed expenses (tuition, rent, subscriptions) with a due date.
3. The engine reserves cash for those expenses in order of due date, soonest first.
4. What's left (the "free balance") is spread across the weeks until the next fixed
   expense is due, giving a **weekly allowance**.
5. "Available this week" = that weekly allowance minus what's already been spent on
   day-to-day expenses this week.

See `src/lib/engine.ts` for the calculation, and `src/lib/engine.test.ts` for the cases
it's expected to handle.

## Features

- **Home dashboard** — the weekly spendable number, upcoming fixed expenses and how
  much is reserved for each, and a spending-by-category breakdown.
- **Add income / add expense flows** — quick income logging, plus an expense flow that
  splits into day-to-day (variable) vs. fixed/upcoming.
- **Notifications** — an in-app weekly spending summary and monthly alerts when a fixed
  expense is coming up, generated client-side from your data (no backend required).
- **History** — every entry, filterable by category and date range.

## Stack

React + TypeScript + Vite, Tailwind CSS v4, `date-fns`, `react-router-dom`. Data
persists to `localStorage` — no backend needed for this prototype.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and build for production
npm test         # run the engine unit tests
```
