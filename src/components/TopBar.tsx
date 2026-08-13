import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

export function TopBar({ title, back, action }: { title: string; back?: boolean; action?: ReactNode }) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 bg-surface/90 backdrop-blur px-4 py-4 border-b border-border">
      {back && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="-ml-1.5 flex h-8 w-8 items-center justify-center rounded-full text-ink active:bg-brand-50"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      <h1 className="flex-1 text-[17px] font-semibold text-ink">{title}</h1>
      {action}
    </header>
  )
}
