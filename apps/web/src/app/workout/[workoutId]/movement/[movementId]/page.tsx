"use client";

import { ProtectedRoute } from "@components/auth/ProtectedRoute";
import { MovementDetailSkeleton } from "@components/ui/skeleton-patterns";
import { Suspense, lazy, use } from "react";

// Lazy load the heavy MovementDetail component
const MovementDetail = lazy(
  () => import("@components/features/MovementDetail")
);

interface MovementDetailPageProps {
  params: Promise<{ workoutId: string; movementId: string }>;
}

export default function MovementDetailPage({
  params,
}: MovementDetailPageProps) {
  // Use React's `use` hook to unwrap the Promise directly
  const { workoutId, movementId } = use(params);

  return (
    <ProtectedRoute>
      <Suspense fallback={<MovementDetailSkeleton />}>
        <MovementDetail
          movementId={movementId}
          workoutId={workoutId}
          returnPath="/"
          returnLabel="Return to Dashboard"
        />
      </Suspense>
    </ProtectedRoute>
  );
}
