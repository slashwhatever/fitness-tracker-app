"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MovementDetailSkeleton } from "@/components/ui/skeleton-patterns";
import { useSearchParams } from "next/navigation";
import { Suspense, lazy, use } from "react";

// Lazy load the heavy MovementDetail component
const MovementDetail = lazy(
  () => import("@/components/features/MovementDetail")
);

interface LibraryMovementDetailPageProps {
  params: Promise<{ movementId: string }>;
}

export default function LibraryMovementDetailPage({
  params,
}: LibraryMovementDetailPageProps) {
  const searchParams = useSearchParams();
  const isQuickLog = searchParams.get("quickLog") === "true";

  // Use React's `use` hook to unwrap the Promise directly
  const { movementId } = use(params);

  return (
    <ProtectedRoute>
      <Suspense fallback={<MovementDetailSkeleton />}>
        <MovementDetail
          movementId={movementId}
          returnPath={isQuickLog ? "/" : "/library"}
          returnLabel={isQuickLog ? "Return to Dashboard" : "Return to Library"}
          isQuickLog={isQuickLog}
        />
      </Suspense>
    </ProtectedRoute>
  );
}
