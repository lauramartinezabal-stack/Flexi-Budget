import { useAppStore } from '../store/useAppStore'
import { CURRENCIES } from '../types'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/Card'

export default function Settings() {
  const currency = useAppStore((s) => s.settings.currency)
  const updateSettings = useAppStore((s) => s.updateSettings)

  return (
    <div className="pb-8">
      <PageHeader title="Settings" subtitle="Make Flexi Budget yours" />
      <div className="px-5 mt-1">
        <Card title="Currency">
          <ul className="divide-y divide-sand-200 -mx-1">
            {CURRENCIES.map((c) => {
              const selected = c.code === currency
              return (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => updateSettings({ currency: c.code })}
                    className="w-full flex items-center justify-between px-1 py-3 text-left"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-sand-100 flex items-center justify-center text-[15px] font-semibold text-brand-700">
                        {c.symbol}
                      </span>
                      <span>
                        <span className="block text-[14px] font-medium text-brand-900">{c.label}</span>
                        <span className="block text-[12px] text-gray-400">{c.code}</span>
                      </span>
                    </span>
                    {selected && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 13l4 4L19 7"
                          stroke="#2f9c8e"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>
        <p className="text-[12px] text-gray-400 mt-3 px-1">
          This only changes how amounts are displayed — it doesn't convert anything you've already
          logged.
        </p>
      </div>
    </div>
  )
}
