"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/Card";
import { CATEGORY_COLORS } from "@/lib/colors";
import { CATEGORY_LABELS } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import type { CategoryBreakdown as CategoryBreakdownData } from "@/lib/budget";

interface Props {
  data: CategoryBreakdownData[];
  total: number;
}

export function CategoryBreakdown({ data, total }: Props) {
  const hasData = total > 0;

  return (
    <section>
      <h2 className="mb-3 text-base font-semibold">Spending by category</h2>
      <Card>
        <p className="mb-3 text-xs text-foreground-muted">Last 30 days &middot; variable spending</p>
        {!hasData ? (
          <p className="py-6 text-center text-sm text-foreground-muted">
            No variable expenses logged yet.
          </p>
        ) : (
          <div className="flex items-center gap-4">
            <div className="h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.filter((d) => d.amount > 0)}
                    dataKey="amount"
                    nameKey="category"
                    innerRadius={38}
                    outerRadius={58}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {data
                      .filter((d) => d.amount > 0)
                      .map((d) => (
                        <Cell key={d.category} fill={CATEGORY_COLORS[d.category]} />
                      ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              {data.map((d) => (
                <div key={d.category} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[d.category] }}
                    />
                    {CATEGORY_LABELS[d.category]}
                  </span>
                  <span className="text-foreground-muted">{formatCurrency(d.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </section>
  );
}
