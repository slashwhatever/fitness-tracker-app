"use client";

import ContextualNavigation from "@/components/common/ContextualNavigation";
import MovementCard from "@/components/common/MovementCard";
import SearchFilters from "@/components/common/SearchFilters";
import { Typography } from "@/components/common/Typography";
import { LibrarySkeleton } from "@/components/ui/skeleton-patterns";
import { useMovementTemplates } from "@/hooks/useMovements";
import { MovementTemplate } from "@/models/types";
import { useMemo, useState } from "react";

export default function MovementLibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch movement templates and muscle groups from database
  const {
    data: movementTemplates = [],
    isLoading,
    error,
  } = useMovementTemplates();

  const filteredMovements = useMemo(() => {
    return movementTemplates
      .filter((movement) => {
        // Search filter - search in name and muscle groups
        const matchesSearch =
          searchTerm === "" ||
          movement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movement.muscle_groups.some((group) =>
            group.toLowerCase().includes(searchTerm.toLowerCase())
          );

        return matchesSearch;
      })
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
  }, [movementTemplates, searchTerm]);

  const handleMovementClick = (movement: MovementTemplate) => {
    // TODO: Handle movement selection (for Story 1.4)
    console.log("Selected movement:", movement);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <ContextualNavigation context={{ type: "library" }} />
        <main className="p-2 sm:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-2 sm:space-y-4 mt-4">
            <div className="text-center py-12">
              <div className="text-destructive mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 14.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">
                Error loading movement library
              </h3>
              <p className="text-muted-foreground">
                {error.message ||
                  "Please try refreshing the page or contact support."}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ContextualNavigation context={{ type: "library" }} />
      <main className="p-2 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-2 sm:space-y-4 mt-4">
          {/* Header */}
          <Typography variant="title1">Movement library</Typography>
          <Typography variant="caption">
            Browse and discover exercises for your workouts
          </Typography>

          {/* Search */}
          <SearchFilters onSearchChange={setSearchTerm} />

          {/* Movement Grid */}
          <div className="mb-6">
            <Typography variant="title2">
              Exercises ({isLoading ? "..." : filteredMovements.length})
            </Typography>
            <Typography variant="caption">
              {isLoading
                ? "Loading..."
                : filteredMovements.length === movementTemplates.length
                ? "Showing all exercises"
                : `Filtered from ${movementTemplates.length} total exercises`}
            </Typography>
          </div>
          {isLoading ? (
            <div className="text-center py-12">
              <LibrarySkeleton />
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <Typography variant="title3">No exercises found</Typography>
              <Typography variant="caption">
                Try adjusting your search terms or filters to find what
                you&apos;re looking for.
              </Typography>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMovements.map((movement) => (
                <MovementCard
                  key={movement.id}
                  movement={movement}
                  onClick={handleMovementClick}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
