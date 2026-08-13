import { Link } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

export function AddHub() {
  return (
    <div className="flex flex-col">
      <TopBar title="Add" />
      <div className="flex flex-col gap-3 px-4 py-5">
        <Link
          to="/add/income"
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface-raised p-4 active:bg-brand-50"
        >
          <ArrowDownCircle className="text-brand-600" size={28} />
          <div className="flex flex-col text-left">
            <span className="text-[15px] font-medium text-ink">Log income</span>
            <span className="text-[13px] text-ink-muted">Scholarship, family support, a job, or anything else</span>
          </div>
        </Link>
        <Link
          to="/add/expense"
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface-raised p-4 active:bg-brand-50"
        >
          <ArrowUpCircle className="text-ink" size={28} />
          <div className="flex flex-col text-left">
            <span className="text-[15px] font-medium text-ink">Log an expense</span>
            <span className="text-[13px] text-ink-muted">Day-to-day spending, or an upcoming fixed bill</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
