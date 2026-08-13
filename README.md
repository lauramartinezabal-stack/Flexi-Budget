# Flexi Budget

A personal finance app for students and people with irregular income. Instead of
a fixed monthly budget, Flexi Budget answers one question at all times: **"How
much can I safely spend this week without running out?"**

## How the weekly number is calculated

1. Log income as it arrives — no fixed schedule assumed.
2. Log fixed/upcoming expenses (tuition, rent, subscriptions) with a due date.
3. The engine reserves money for those fixed expenses first, in order of due
   date, out of your current balance.
4. Whatever's left is divided across the weeks remaining until your nearest
   upcoming bill — that's your **available this week** number. It recalculates
   automatically every time you log income or a new expense.

## Screens

- **Home** — the weekly number, upcoming fixed expenses with how much is
  reserved for each, and a spending-by-category breakdown for the last 7 days.
- **Add income / Add expense** — quick-add flows, reachable from the `+` button.
- **History** — every entry, filterable by type, category, and date range.
- **Alerts** — an in-app notification center with a weekly spending digest and
  reminders as fixed expenses approach.

## Tech

- React + TypeScript + Vite
- Tailwind CSS v4 (calm, warm palette; light/dark via `prefers-color-scheme`)
- Zustand, persisted to `localStorage` — no backend required for this MVP
- React Router

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and build for production
```

## Out of scope for v1

Bank account syncing, multi-currency, investment features, social/sharing
features. All entry is manual for now.
