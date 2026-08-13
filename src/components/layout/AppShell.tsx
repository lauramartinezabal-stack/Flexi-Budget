import type { PropsWithChildren } from "react";
import { BottomNav } from "./BottomNav";
import { AddEntrySheet } from "../forms/AddEntrySheet";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-full">
      <main className="mx-auto w-full max-w-md px-4 pb-28 pt-6">{children}</main>
      <BottomNav />
      <AddEntrySheet />
    </div>
  );
}
