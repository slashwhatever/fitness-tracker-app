"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import MovementDetail from "@/components/features/MovementDetail";
import { use } from "react";

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
      <MovementDetail
        movementId={movementId}
        workoutId={workoutId}
        returnPath="/"
        returnLabel="Return to Dashboard"
      />
    </ProtectedRoute>
  );
}
