import type { BudgetStatus } from "../lib/calc";
import { formatCurrency } from "../lib/format";

const statusStyles: Record<
  BudgetStatus,
  { bg: string; ring: string; text: string; sub: string; label: string }
> = {
  calm: {
    bg: "bg-primary-soft",
    ring: "ring-primary/20",
    text: "text-primary-dark",
    sub: "text-primary-dark/70",
    label: "You're on track",
  },
  warning: {
    bg: "bg-amber-soft",
    ring: "ring-amber/25",
    text: "text-amber",
    sub: "text-ink-soft",
    label: "A bill is coming up soon",
  },
  critical: {
    bg: "bg-critical-soft",
    ring: "ring-critical/25",
    text: "text-critical",
    sub: "text-ink-soft",
    label: "Nothing left to spend this week",
  },
};

export function AvailableCard({
  weeklyAvailable,
  status,
  horizonWeeks,
  empty = false,
}: {
  weeklyAvailable: number;
  status: BudgetStatus;
  horizonWeeks: number;
  empty?: boolean;
}) {
  const s = statusStyles[status];
  const shown = Math.max(0, weeklyAvailable);

  return (
    <div
      className={`rounded-3xl ${s.bg} ring-1 ${s.ring} p-6 text-center flex flex-col items-center gap-1`}
    >
      <p className={`text-sm font-medium ${s.sub}`}>Available this week</p>
      <p className={`text-5xl font-semibold tracking-tight ${s.text}`}>
        {formatCurrency(shown)}
      </p>
      <p className={`text-xs mt-1 ${s.sub}`}>
        {empty ? "Add your first income to get started" : s.label}
      </p>
      {!empty && horizonWeeks > 1 && (
        <p className={`text-xs ${s.sub}`}>
          Saving up over the next {horizonWeeks} weeks for what's ahead
        </p>
      )}
    </div>
  );
}
