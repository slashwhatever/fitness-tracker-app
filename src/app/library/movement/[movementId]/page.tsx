"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import MovementDetail from "@/components/features/MovementDetail";
import { MovementDetailSkeleton } from "@/components/ui/skeleton-patterns";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface LibraryMovementDetailPageProps {
  params: Promise<{ movementId: string }>;
}

export default function LibraryMovementDetailPage({
  params,
}: LibraryMovementDetailPageProps) {
  const [paramsResolved, setParamsResolved] = useState<{
    movementId: string;
  } | null>(null);
  const searchParams = useSearchParams();
  const isQuickLog = searchParams.get("quickLog") === "true";

  // Resolve async params
  useEffect(() => {
    params.then(setParamsResolved);
  }, [params]);

  if (!paramsResolved) {
    return (
      <ProtectedRoute>
        <MovementDetailSkeleton />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MovementDetail
        movementId={paramsResolved.movementId}
        returnPath={isQuickLog ? "/" : "/library"}
        returnLabel={isQuickLog ? "Return to Dashboard" : "Return to Library"}
        isQuickLog={isQuickLog}
      />
    </ProtectedRoute>
  );
}
