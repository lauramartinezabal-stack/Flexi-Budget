const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

const dateFormatterWithYear = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function toDateInput(date: string | Date): Date {
  return typeof date === "string" ? new Date(date + "T00:00:00") : date;
}

export function formatDate(date: string | Date): string {
  return dateFormatter.format(toDateInput(date));
}

export function formatDateWithYear(date: string | Date): string {
  return dateFormatterWithYear.format(toDateInput(date));
}
