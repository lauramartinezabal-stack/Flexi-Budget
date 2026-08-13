export function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur px-5 pt-6 pb-3">
      <h1 className="text-lg font-semibold text-[var(--color-ink)]">{title}</h1>
    </header>
  );
}
