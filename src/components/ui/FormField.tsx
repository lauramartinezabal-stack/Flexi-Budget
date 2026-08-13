import type { PropsWithChildren } from "react";

export function FormField({ label, children }: PropsWithChildren<{ label: string }>) {
  return (
    <label className="block mb-4">
      <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle = {
  background: "var(--surface-sunken)",
  color: "var(--text-primary)",
  border: "1px solid var(--border-hairline)",
};

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      className={`w-full rounded-xl px-3.5 py-3 text-base outline-none focus:ring-2 ${className}`}
      style={{ ...inputStyle, ["--tw-ring-color" as string]: "var(--brand)" }}
      {...rest}
    />
  );
}

export function AmountInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-medium"
        style={{ color: "var(--text-muted)" }}
      >
        $
      </span>
      <input
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        placeholder="0.00"
        className={`w-full rounded-xl py-3 pl-7 pr-3.5 text-lg font-semibold outline-none focus:ring-2 tabular-nums ${className}`}
        style={{ ...inputStyle, ["--tw-ring-color" as string]: "var(--brand)" }}
        {...rest}
      />
    </div>
  );
}
