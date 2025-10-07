"use client";

import { useBackgroundSync } from "@/hooks";
import { registerServiceWorker } from "@/lib/serviceWorker";
import React from "react";

export default function BackgroundSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useBackgroundSync();

  React.useEffect(() => {
    registerServiceWorker();
  }, []);

  return <>{children}</>;
}
