import Link from "next/link";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export default function AddHubPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 px-4 pt-6">
      <h1 className="text-lg font-semibold">What would you like to add?</h1>

      <Link
        href="/income/add"
        className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
          <ArrowUpCircle size={24} />
        </div>
        <div>
          <p className="font-medium">Income</p>
          <p className="text-sm text-foreground-muted">
            Money that arrived — scholarship, family, a gig
          </p>
        </div>
      </Link>

      <Link
        href="/expense/add"
        className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
          <ArrowDownCircle size={24} />
        </div>
        <div>
          <p className="font-medium">Expense</p>
          <p className="text-sm text-foreground-muted">
            Something you spent, or a bill that&apos;s coming up
          </p>
        </div>
      </Link>
    </main>
  );
}
