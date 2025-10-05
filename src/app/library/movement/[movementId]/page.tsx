"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import MovementDetail from "@/components/features/MovementDetail";
import { useSearchParams } from "next/navigation";
import { use } from "react";

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
      <MovementDetail
        movementId={movementId}
        returnPath={isQuickLog ? "/" : "/library"}
        returnLabel={isQuickLog ? "Return to Dashboard" : "Return to Library"}
        isQuickLog={isQuickLog}
      />
    </ProtectedRoute>
  );
}
