import type { PropsWithChildren } from "react";
import { useEffect } from "react";

export function Sheet({
  title,
  onClose,
  onBack,
  children,
}: PropsWithChildren<{ title: string; onClose: () => void; onBack?: () => void }>) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(10, 14, 11, 0.45)" }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] max-h-[88vh] overflow-y-auto animate-[slideUp_0.22s_ease-out]"
        style={{ background: "var(--surface-card)" }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full sm:hidden" style={{ background: "var(--border-hairline)" }} />
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                aria-label="Back"
                className="-ml-1 flex h-8 w-8 items-center justify-center rounded-full"
                style={{ color: "var(--text-secondary)" }}
              >
                ‹
              </button>
            )}
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-lg"
            style={{ color: "var(--text-secondary)", background: "var(--surface-sunken)" }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
