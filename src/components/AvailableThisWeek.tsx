import { formatCurrency } from "@/lib/format";
import type { BudgetSummary } from "@/lib/budget";

interface Props {
  summary: BudgetSummary;
}

export function AvailableThisWeek({ summary }: Props) {
  const { remainingThisWeek, availableThisWeek, spentThisWeek, spendableBalance } = summary;

  const isTight = spendableBalance <= 0 || remainingThisWeek < availableThisWeek * 0.15;
  const isCritical = spendableBalance < 0;

  const ringColor = isCritical ? "var(--danger)" : isTight ? "var(--warn)" : "var(--primary)";
  const softBg = isCritical ? "bg-danger-soft" : isTight ? "bg-warn-soft" : "bg-primary-soft";

  return (
    <div className={`rounded-3xl border border-border p-6 text-center ${softBg}`}>
      <p className="text-sm font-medium text-foreground-muted">Available this week</p>
      <p
        className="mt-2 text-5xl font-semibold tracking-tight"
        style={{ color: ringColor }}
      >
        {formatCurrency(remainingThisWeek)}
      </p>
      {isCritical ? (
        <p className="mt-3 text-sm font-medium" style={{ color: "var(--danger)" }}>
          You&apos;re {formatCurrency(Math.abs(spendableBalance))} short of your upcoming fixed
          costs — go easy until more income arrives.
        </p>
      ) : (
        <p className="mt-3 text-sm text-foreground-muted">
          {formatCurrency(spentThisWeek)} spent of a {formatCurrency(availableThisWeek)} weekly
          allowance
        </p>
      )}
    </div>
  );
}
