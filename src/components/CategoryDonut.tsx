import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { CategoryTotal } from "../lib/budgetEngine";
import { CATEGORY_LABELS } from "../types";
import { formatCurrency } from "../lib/format";

const CATEGORY_COLORS: Record<string, string> = {
  food: "#578a60",
  transport: "#3f8685",
  leisure: "#d99f2e",
  other: "#ab8a58",
};

export function CategoryDonut({ data }: { data: CategoryTotal[] }) {
  const total = data.reduce((sum, d) => sum + d.total, 0);
  const chartData = data.filter((d) => d.total > 0);

  if (total === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-1 text-sage-400">
        <p className="text-sm">No spending logged yet this period.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-32 w-32 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="category"
              innerRadius="65%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-medium text-sage-400">Total</span>
          <span className="text-sm font-semibold text-sage-800">{formatCurrency(total)}</span>
        </div>
      </div>

      <ul className="flex-1 space-y-1.5">
        {data.map((c) => (
          <li key={c.category} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 text-sage-700">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[c.category] }}
              />
              {CATEGORY_LABELS[c.category as keyof typeof CATEGORY_LABELS]}
            </span>
            <span className="text-sage-500">
              {formatCurrency(c.total)}
              <span className="ml-1 text-xs text-sage-400">({Math.round(c.percent)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
