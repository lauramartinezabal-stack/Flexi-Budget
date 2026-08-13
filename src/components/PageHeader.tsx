"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function PageHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <header className="flex items-center gap-3 px-4 pt-6">
      <button
        onClick={() => router.back()}
        aria-label="Go back"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface"
      >
        <ChevronLeft size={18} />
      </button>
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  );
}
