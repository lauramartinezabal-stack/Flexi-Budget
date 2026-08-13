import type { PropsWithChildren } from "react";

export function Card({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`rounded-2xl border border-border bg-surface p-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
