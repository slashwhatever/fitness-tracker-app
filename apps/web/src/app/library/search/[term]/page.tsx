import { getMovementTemplates } from "@/lib/data/movement-templates";
import { ProtectedRoute } from "@components/auth/ProtectedRoute";
import ContextualNavigation from "@components/common/ContextualNavigation";
import { Typography } from "@components/common/Typography";
import LibraryContentServer from "@components/features/LibraryContentServer";
import LibrarySearchWrapper from "@components/features/LibrarySearchWrapper";
import { LibrarySkeleton } from "@components/ui/skeleton-patterns";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface LibrarySearchPageProps {
  params: Promise<{
    term: string;
  }>;
}

// Popular search terms to pre-generate at build time
const POPULAR_SEARCH_TERMS = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
  "push",
  "pull",
  "squat",
  "deadlift",
  "bench",
  "press",
];

export async function generateStaticParams() {
  return POPULAR_SEARCH_TERMS.map((term) => ({
    term: encodeURIComponent(term.toLowerCase()),
  }));
}

export async function generateMetadata({
  params,
}: LibrarySearchPageProps): Promise<Metadata> {
  const { term } = await params;
  const decodedTerm = decodeURIComponent(term);

  return {
    title: `${decodedTerm} exercises - Movement Library - Logset`,
    description: `Find ${decodedTerm} exercises and movements for your workouts`,
  };
}

export default async function LibrarySearchPage({
  params,
}: LibrarySearchPageProps) {
  const { term } = await params;
  const searchTerm = decodeURIComponent(term);

  // Validate search term
  if (!searchTerm || searchTerm.length > 50) {
    notFound();
  }

  // Pre-filter movements to check if any results exist
  const movements = await getMovementTemplates();
  const hasResults = movements.some(
    (movement) =>
      movement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.muscle_groups.some((group) =>
        group.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  if (!hasResults) {
    notFound();
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <ContextualNavigation context={{ type: "library" }} />
        <main className="p-2 sm:p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4 mt-4">
            {/* Header - Renders immediately */}
            <Typography variant="title1">Movement library</Typography>
            <Typography variant="caption">
              Showing results for &quot;{searchTerm}&quot;
            </Typography>

            <LibrarySearchWrapper>
              {/* Streamed content with loading state */}
              <Suspense fallback={<LibrarySkeleton />}>
                <LibraryContentServer
                  searchTerm={searchTerm}
                  initialMovements={movements}
                />
              </Suspense>
            </LibrarySearchWrapper>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

// Enable static generation with revalidation for popular search terms
export const revalidate = 3600; // Revalidate every hour
