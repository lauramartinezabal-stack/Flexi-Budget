import type { PropsWithChildren, HTMLAttributes } from "react";

export function Card({
  children,
  className = "",
  style,
  ...rest
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-hairline)",
        boxShadow: "var(--shadow-card)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }: PropsWithChildren<{ action?: React.ReactNode }>) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
        {children}
      </h2>
      {action}
    </div>
  );
}
