import type { CategoryBreakdownItem } from "../lib/calc";
import { formatCurrency } from "../lib/format";
import { EXPENSE_CATEGORIES } from "../types";

const categoryLabel = (cat: string) =>
  EXPENSE_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;

const categoryBg: Record<string, string> = {
  food: "bg-food",
  transport: "bg-transport",
  leisure: "bg-leisure",
  other: "bg-other",
};

export function CategoryBreakdown({
  items,
  total,
}: {
  items: CategoryBreakdownItem[];
  total: number;
}) {
  if (total === 0) {
    return (
      <p className="text-sm text-ink-faint py-2">
        No variable spending logged in the last 7 days yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-3 w-full overflow-hidden rounded-full gap-[2px] bg-surface-muted">
        {items.map((item) => (
          <div
            key={item.category}
            className={categoryBg[item.category]}
            style={{ width: `${item.percent}%` }}
            aria-hidden="true"
          />
        ))}
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.category}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2 text-ink">
              <span
                className={`h-2.5 w-2.5 rounded-full ${categoryBg[item.category]}`}
                aria-hidden="true"
              />
              {categoryLabel(item.category)}
            </span>
            <span className="text-ink-soft">
              {formatCurrency(item.total)}{" "}
              <span className="text-ink-faint">
                ({Math.round(item.percent)}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
