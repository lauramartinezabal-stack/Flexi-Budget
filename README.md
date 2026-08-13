# Flexi Budget

A personal finance app for students and people with irregular income. Instead of dividing a fixed monthly salary into four weeks, Flexi Budget answers one question at all times: **how much can I safely spend this week without jeopardizing what's already due?**

## How it works

- Log income as it arrives — no fixed schedule assumed.
- Log fixed/upcoming expenses (tuition, rent, subscriptions) with a due date.
- The engine reserves your balance for the soonest-due fixed expenses first, then divides whatever's left over the weeks remaining until the next unfunded due date — that's your **available this week** number.
- Log day-to-day variable spending by category (food, transport, leisure, other) to see where the week's money is going.
- In-app notifications: a weekly summary of last week's spending plus the new weekly number, and an alert when a fixed expense enters its 30-day due window.

## Stack

React + TypeScript + Vite, Tailwind CSS v4, React Router. State persists to `localStorage` — no backend required for this MVP.

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # typecheck + production build
```

## Scope

v1 is manual entry only: no bank syncing, multi-currency, investing, or social features.
