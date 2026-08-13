import { useState } from "react";
import { useBudgetStore } from "../store/useBudgetStore";

export function Settings() {
  const loadSampleData = useBudgetStore((s) => s.loadSampleData);
  const resetAll = useBudgetStore((s) => s.resetAll);
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-lg font-semibold text-sage-900">Settings</h1>

      <section className="rounded-3xl border border-sage-200/70 bg-white p-5">
        <h2 className="text-sm font-semibold text-sage-800">Data</h2>
        <p className="mt-1 text-xs text-sage-500">
          Everything is stored privately on this device. There's no account and nothing is sent
          anywhere.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={loadSampleData}
            className="rounded-2xl border border-sage-200 py-2.5 text-sm font-medium text-sage-600"
          >
            Load sample data
          </button>
          {confirmingReset ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  resetAll();
                  setConfirmingReset(false);
                }}
                className="flex-1 rounded-2xl bg-coral-500 py-2.5 text-sm font-medium text-white"
              >
                Confirm erase
              </button>
              <button
                onClick={() => setConfirmingReset(false)}
                className="flex-1 rounded-2xl border border-sage-200 py-2.5 text-sm font-medium text-sage-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingReset(true)}
              className="rounded-2xl border border-coral-300 py-2.5 text-sm font-medium text-coral-600"
            >
              Erase all data
            </button>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-sage-200/70 bg-white p-5">
        <h2 className="text-sm font-semibold text-sage-800">How "available this week" works</h2>
        <p className="mt-2 text-xs leading-relaxed text-sage-500">
          Flexi Budget adds up everything you've logged, sets aside money for your soonest upcoming
          fixed expenses first, then spreads whatever's left over the weeks remaining until the next
          bill is due. Add income any time — the number updates automatically.
        </p>
      </section>
    </div>
  );
}
