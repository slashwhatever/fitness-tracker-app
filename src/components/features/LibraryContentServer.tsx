import MovementCard from "@/components/common/MovementCard";
import { Typography } from "@/components/common/Typography";
import { getMovementTemplates } from "@/lib/data/movement-templates";
import { MovementTemplate } from "@/models/types";

interface LibraryContentServerProps {
  searchTerm?: string;
}

export default async function LibraryContentServer({
  searchTerm = "",
}: LibraryContentServerProps) {
  // Fetch movement templates on server-side
  const movementTemplates = await getMovementTemplates();

  // Filter movements based on search term (server-side filtering)
  const filteredMovements = movementTemplates
    .filter((movement) => {
      if (!searchTerm) return true;

      const searchLower = searchTerm.toLowerCase();
      return (
        movement.name.toLowerCase().includes(searchLower) ||
        movement.muscle_groups.some((group) =>
          group.toLowerCase().includes(searchLower)
        )
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleMovementClick = (movement: MovementTemplate) => {
    // TODO: Handle movement selection (for Story 1.4)
    console.log("Selected movement:", movement);
  };

  return (
    <>
      {/* Movement Grid */}
      <div className="mb-6">
        <Typography variant="title2">
          Exercises ({filteredMovements.length})
        </Typography>
        <Typography variant="caption">
          {filteredMovements.length === movementTemplates.length
            ? "Showing all exercises"
            : `Filtered from ${movementTemplates.length} total exercises`}
        </Typography>
      </div>

      {filteredMovements.length === 0 ? (
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
            Try adjusting your search terms or filters to find what you're
            looking for.
          </Typography>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMovements.map((movement) => (
            <MovementCard
              key={movement.id}
              movement={movement}
              onClick={handleMovementClick}
            />
          ))}
        </div>
      )}
    </>
  );
}
