"use client";

import { useCreateUserMovement, useUserMovements } from "@/hooks/useMovements";
import { useTrackingTypes } from "@/hooks/useTrackingTypes";
import { MovementTemplate } from "@/models/types";
import MovementCard from "@components/common/MovementCard";
import { Typography } from "@components/common/Typography";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface LibraryContentServerProps {
  searchTerm?: string;
  initialMovements: MovementTemplate[];
}

export default function LibraryContentServer({
  searchTerm = "",
  initialMovements,
}: LibraryContentServerProps) {
  const router = useRouter();
  const [processingMovement, setProcessingMovement] = useState<string | null>(
    null
  );

  // Get user movements to check if template already has a user movement
  const { data: userMovements = [] } = useUserMovements();
  const { data: trackingTypes = [] } = useTrackingTypes();
  const createUserMovementMutation = useCreateUserMovement();

  // Combine movement templates with user movements
  const allMovements = useMemo(() => {
    // Convert user movements to template format for consistent display
    const userMovementsAsTemplates = userMovements.map((userMovement) => ({
      id: userMovement.id,
      name: userMovement.name,
      muscle_groups: userMovement.muscle_groups,
      tracking_type:
        trackingTypes.find((tt) => tt.id === userMovement.tracking_type_id)
          ?.name || "unknown",
      experience_level: "Intermediate" as
        | "Beginner"
        | "Intermediate"
        | "Advanced", // Default for user movements
      instructions: userMovement.personal_notes || null,
      created_at: userMovement.created_at,
      tags: userMovement.tags,
      tracking_type_id: userMovement.tracking_type_id,
      updated_at: userMovement.updated_at,
      isUserMovement: true, // Flag to identify user movements
    }));

    // Add template flag to movement templates
    const templatesWithFlag = initialMovements.map((template) => ({
      ...template,
      isUserMovement: false,
    }));

    // Combine and deduplicate (user movements take precedence over templates)
    const combined = [...userMovementsAsTemplates];
    templatesWithFlag.forEach((template) => {
      // Only add template if user doesn't have a movement based on this template
      const hasUserMovement = userMovements.some(
        (um) => um.template_id === template.id
      );
      if (!hasUserMovement) {
        combined.push(template);
      }
    });

    return combined;
  }, [initialMovements, userMovements, trackingTypes]);

  // Filter movements based on search term
  const filteredMovements = allMovements
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
    .sort((a, b) => {
      // Sort user movements first, then alphabetically
      if (a.isUserMovement && !b.isUserMovement) return -1;
      if (!a.isUserMovement && b.isUserMovement) return 1;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-2">
      {/* Movement Grid */}
      <Typography variant="title2">
        Exercises ({filteredMovements.length})
      </Typography>
      <Typography variant="caption">
        {filteredMovements.length === allMovements.length
          ? "Showing all exercises"
          : `Filtered from ${allMovements.length} total exercises`}
      </Typography>

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
            Try adjusting your search terms or filters to find what you&apos;re
            looking for.
          </Typography>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2">
          {filteredMovements.map((movement) => (
            <MovementCard
              key={movement.id}
              movement={movement}
              selected={processingMovement === movement.id} // Show loading state
              onClick={async (movement) => {
                if (processingMovement === movement.id) return; // Prevent double-clicks
                setProcessingMovement(movement.id);

                try {
                  // If this is already a user movement, navigate directly
                  if ("isUserMovement" in movement && movement.isUserMovement) {
                    router.push(`/library/movement/${movement.id}`);
                    return;
                  }

                  // This is a template - check if user already has a movement for this template
                  const existingUserMovement = userMovements.find(
                    (um) => um.template_id === movement.id
                  );

                  if (existingUserMovement) {
                    // Navigate to existing user movement
                    router.push(`/library/movement/${existingUserMovement.id}`);
                  } else {
                    // Create new user movement from template
                    const trackingType = trackingTypes.find(
                      (tt) => tt.name === movement.tracking_type
                    );

                    if (!trackingType) {
                      throw new Error(
                        `Unknown tracking type: ${movement.tracking_type}`
                      );
                    }

                    const newUserMovement =
                      await createUserMovementMutation.mutateAsync({
                        template_id: movement.id, // Link to the template
                        name: movement.name,
                        muscle_groups: movement.muscle_groups,
                        tracking_type_id: trackingType.id,
                        personal_notes: movement.instructions || null,
                      });

                    // Navigate to the new user movement
                    router.push(`/library/movement/${newUserMovement.id}`);
                  }
                } catch (error) {
                  console.error("Failed to handle movement click:", error);
                } finally {
                  setProcessingMovement(null);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
