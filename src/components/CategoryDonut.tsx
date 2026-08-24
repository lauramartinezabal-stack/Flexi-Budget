import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import type { CategoryCapItem } from '../lib/budget'
import { useFormatCurrency } from '../hooks/useFormatCurrency'
import { ProgressBar } from './ProgressBar'

const COLORS: Record<string, string> = {
  food: '#4fb6a8',
  transport: '#82d1c4',
  leisure: '#c98a2c',
  other: '#b3e5dd',
}

export function CategoryDonut({
  items,
  total,
  showCaps = false,
}: {
  items: CategoryCapItem[]
  total: number
  showCaps?: boolean
}) {
  const { format } = useFormatCurrency()
  const nonZero = items.filter((i) => i.total > 0)
  const data = nonZero.length > 0 ? nonZero : [{ category: 'other', label: 'No spending yet', icon: '', total: 1, percent: 1 }]

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="w-28 h-28 shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="label"
                innerRadius={38}
                outerRadius={54}
                paddingAngle={nonZero.length > 1 ? 3 : 0}
                stroke="none"
              >
                {data.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={nonZero.length > 0 ? COLORS[entry.category] : '#eee9da'}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[13px] font-semibold text-brand-900">{format(total)}</span>
            <span className="text-[10px] text-gray-400">spent</span>
          </div>
        </div>
        <ul className="flex-1 space-y-1.5">
          {items.map((item) => (
            <li key={item.category} className="flex items-center justify-between text-[13px]">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: item.total > 0 ? COLORS[item.category] : '#e9e5d9' }}
                />
                {item.icon} {item.label}
              </span>
              <span className="font-medium text-brand-900">{format(item.total)}</span>
            </li>
          ))}
        </ul>
      </div>

      {showCaps && (
        <ul className="mt-4 pt-4 border-t border-sand-200 space-y-3">
          {items.map((item) => (
            <li key={item.category}>
              <div className="flex items-center justify-between text-[13px] mb-1">
                <span className="flex items-center gap-1.5 text-gray-600">
                  {item.icon} {item.label}
                </span>
                {item.over > 0 ? (
                  <span className="text-[12px] text-amber-warn font-medium">
                    {format(item.over)} over plan
                  </span>
                ) : (
                  <span className="text-[12px] text-gray-500">
                    {format(item.remaining)} left of {format(item.cap)}
                  </span>
                )}
              </div>
              <ProgressBar
                progress={item.cap > 0 ? item.spentThisWeek / item.cap : 0}
                colorClassName={item.over > 0 ? 'bg-amber-warn' : 'bg-brand-400'}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
