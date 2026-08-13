# Flexi Budget

A dynamic weekly budgeting app for students and people with irregular income.

Instead of dividing a fixed monthly salary into 4 weeks, Flexi Budget answers
one question at all times: **"How much can I safely spend this week without
running out?"**

## How it works

1. Log income as it arrives — no fixed schedule assumed.
2. Log upcoming fixed expenses (tuition, rent, subscriptions) with due dates.
3. The engine reserves your balance for the soonest-due fixed expenses first,
   then spreads whatever's left across the weeks remaining until the next
   bill — that's your **available this week** number.
4. It recalculates automatically every time you add income or a new expense.

See `src/lib/budgetEngine.ts` for the calculation engine and
`src/lib/budgetEngine.test.ts` for its test coverage.

## Screens

- **Home** — available-this-week number, upcoming fixed expenses with
  reserved-vs-owed progress, and a spending-by-category breakdown.
- **Add** — quick-add income, or an expense as either day-to-day (variable)
  or fixed/upcoming.
- **History** — full transaction log, filterable by type, category, and date.
- **Notifications** — a weekly recap (spending by category + the new
  available-this-week number) and alerts for fixed expenses approaching
  their due date.
- **Settings** — load sample data or erase everything. All data is stored
  locally in the browser (`localStorage`); there's no backend or account.

## Development

```bash
npm install
npm run dev      # start the dev server
npm test         # run the budget engine test suite (vitest)
npm run build    # type-check and build for production
```
