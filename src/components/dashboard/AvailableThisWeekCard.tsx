import type { WeeklyBudget } from "../../lib/engine";
import { formatMoney } from "../../lib/format";
import { Card } from "../ui/Card";

function statusFor(budget: WeeklyBudget, recentWeekSpend: number) {
  if (budget.weeklyAmount <= 0 || budget.liquidBalance < 0) {
    return {
      tone: "var(--status-critical)",
      soft: "var(--status-critical-soft)",
      message: "Tight week — most of your balance is already reserved for upcoming bills.",
    };
  }
  if (recentWeekSpend > 0 && budget.weeklyAmount < recentWeekSpend * 0.5) {
    return {
      tone: "var(--status-warning)",
      soft: "var(--status-warning-soft)",
      message: "A bit less than usual this week — your fixed expenses are catching up.",
    };
  }
  return {
    tone: "var(--brand)",
    soft: "var(--brand-soft)",
    message: "You're on track. This is safe to spend without touching reserved money.",
  };
}

export function AvailableThisWeekCard({
  budget,
  recentWeekSpend,
}: {
  budget: WeeklyBudget;
  recentWeekSpend: number;
}) {
  const status = statusFor(budget, recentWeekSpend);

  return (
    <Card className="p-6 text-center" style={{ background: status.soft }}>
      <p className="text-[13px] font-medium uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
        Available this week
      </p>
      <p
        className="mt-2 text-5xl font-bold tabular-nums tracking-tight"
        style={{ color: status.tone }}
      >
        {formatMoney(budget.weeklyAmount)}
      </p>
      <p className="mt-3 text-[13px] leading-snug" style={{ color: "var(--text-secondary)" }}>
        {status.message}
      </p>
      <div
        className="mt-5 grid grid-cols-2 gap-3 border-t pt-4 text-left"
        style={{ borderColor: "var(--border-hairline)" }}
      >
        <div>
          <p className="text-[11px] font-medium uppercase" style={{ color: "var(--text-muted)" }}>
            Total balance
          </p>
          <p className="text-[15px] font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
            {formatMoney(budget.liquidBalance)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase" style={{ color: "var(--text-muted)" }}>
            Reserved for bills
          </p>
          <p className="text-[15px] font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
            {formatMoney(budget.totalReserved)}
          </p>
        </div>
      </div>
    </Card>
  );
}
