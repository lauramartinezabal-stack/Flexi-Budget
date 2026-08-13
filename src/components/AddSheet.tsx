import { PiggyBank, Receipt, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AddSheet({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-ink/30"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[480px] rounded-t-3xl bg-surface border-t border-border p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] flex flex-col gap-3 animate-[slideUp_0.18s_ease-out]">
        <div className="flex items-center justify-between mb-1">
          <p className="text-base font-semibold text-ink">What would you like to log?</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-ink-faint p-1"
          >
            <X size={20} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => go("/add/income")}
          className="flex items-center gap-4 rounded-2xl border border-border bg-primary-soft/60 p-4 text-left active:scale-[0.98] transition-transform"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <PiggyBank size={22} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">
              Log income
            </span>
            <span className="block text-xs text-ink-soft">
              Scholarship, family support, a paycheck…
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => go("/add/expense")}
          className="flex items-center gap-4 rounded-2xl border border-border bg-surface-muted p-4 text-left active:scale-[0.98] transition-transform"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-surface">
            <Receipt size={22} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">
              Log expense
            </span>
            <span className="block text-xs text-ink-soft">
              Something you spent, or a bill that's coming up
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
