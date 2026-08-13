import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PageHeader({
  title,
  showBack = false,
}: {
  title: string;
  showBack?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <header className="flex items-center gap-2 px-5 pt-[max(env(safe-area-inset-top),1.25rem)] pb-3">
      {showBack && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="p-1 -ml-1 text-ink-soft"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      <h1 className="text-lg font-semibold text-ink">{title}</h1>
    </header>
  );
}
