import type { Category } from "../../types";
import { CATEGORIES, CATEGORY_LABELS } from "../../types";
import { formatMoney } from "../../lib/format";
import { Card, SectionTitle } from "../ui/Card";

const CATEGORY_COLOR: Record<Category, string> = {
  food: "var(--series-food)",
  transport: "var(--series-transport)",
  leisure: "var(--series-leisure)",
  other: "var(--series-other)",
};

export function CategoryBreakdownSection({ totals }: { totals: Record<Category, number> }) {
  const grandTotal = CATEGORIES.reduce((sum, c) => sum + totals[c], 0);
  const max = Math.max(...CATEGORIES.map((c) => totals[c]), 1);

  return (
    <section className="mt-6">
      <SectionTitle>Spending by category</SectionTitle>
      <Card className="p-4">
        <p className="mb-4 text-[12px] font-medium" style={{ color: "var(--text-muted)" }}>
          Last 7 days · variable spending
        </p>
        {grandTotal === 0 ? (
          <p className="py-4 text-center text-[13px]" style={{ color: "var(--text-secondary)" }}>
            No spending logged in the last 7 days yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3.5">
            {CATEGORIES.map((cat) => {
              const value = totals[cat];
              const pct = max > 0 ? (value / max) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="mb-1 flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-1.5 font-medium" style={{ color: "var(--text-primary)" }}>
                      <span className="h-2 w-2 rounded-full" style={{ background: CATEGORY_COLOR[cat] }} />
                      {CATEGORY_LABELS[cat]}
                    </span>
                    <span className="tabular-nums font-semibold" style={{ color: "var(--text-primary)" }}>
                      {formatMoney(value)}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full" style={{ background: "var(--surface-sunken)" }}>
                    <div
                      className="h-full rounded-full transition-[width] duration-300"
                      style={{ width: `${pct}%`, background: CATEGORY_COLOR[cat] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </section>
  );
}
