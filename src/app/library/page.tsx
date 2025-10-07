import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ContextualNavigation from "@/components/common/ContextualNavigation";
import LibraryErrorBoundary from "@/components/common/LibraryErrorBoundary";
import { Typography } from "@/components/common/Typography";
import { LibrarySkeleton } from "@/components/ui/skeleton-patterns";
import { getMovementTemplates } from "@/lib/data/movement-templates";
import { Suspense, lazy } from "react";

// Lazy load heavy library components
const LibraryContentServer = lazy(
  () => import("@/components/features/LibraryContentServer")
);
const LibrarySearchWrapper = lazy(
  () => import("@/components/features/LibrarySearchWrapper")
);

interface MovementLibraryPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function MovementLibraryPage({
  searchParams,
}: MovementLibraryPageProps) {
  const params = await searchParams;
  const searchTerm = params.search || "";

  // Fetch movement templates on server-side
  const movementTemplates = await getMovementTemplates();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <ContextualNavigation context={{ type: "library" }} />
        <main className="p-2 sm:p-4 lg:p-6">
          <LibraryErrorBoundary>
            <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4 mt-4">
              {/* Header - Renders immediately */}
              <Typography variant="title1">Movement library</Typography>
              <Typography variant="caption">
                Browse your personal movements and discover new exercises
              </Typography>

              <Suspense fallback={<LibrarySkeleton />}>
                <LibrarySearchWrapper>
                  {/* Streamed content with loading state */}
                  <Suspense fallback={<LibrarySkeleton />}>
                    <LibraryContentServer
                      searchTerm={searchTerm}
                      initialMovements={movementTemplates}
                    />
                  </Suspense>
                </LibrarySearchWrapper>
              </Suspense>
            </div>
          </LibraryErrorBoundary>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export const metadata = {
  title: "Movement Library - Logset",
  description: "Browse and discover exercises for your workouts",
};

// Enable static generation with revalidation
export const revalidate = 3600; // Revalidate every hour
