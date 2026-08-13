"use client";

import { useEffect } from "react";
import { useBudgetStore } from "@/lib/store";

export function StoreHydration() {
  useEffect(() => {
    useBudgetStore.persist.rehydrate();
  }, []);

  return null;
}
