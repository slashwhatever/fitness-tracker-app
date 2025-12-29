"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ContextualNavigation from "@/components/common/ContextualNavigation";
import MovementListItem from "@/components/common/MovementListItem";
import { Typography } from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddMovementsToWorkout,
  useCreateUserMovement,
  useMovementTemplates,
  useRemoveMovementsFromWorkout,
  useUserMovements,
  useWorkoutMovements,
} from "@/hooks/useMovements";
import { useTrackingTypes } from "@/hooks/useTrackingTypes";
import { useWorkout } from "@/hooks/useWorkouts";
import {
  getNextOrderIndex,
  prepareWorkoutMovements,
} from "@/lib/utils/workout-helpers";
import type { UserMovement } from "@fitness/shared";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react";

interface AddMovementsPageProps {
  params: Promise<{ workoutId: string }>;
}

function AddMovementsPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex space-x-3">
        <Skeleton className="h-12 flex-1" />
        <Skeleton className="h-12 w-32" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
      <div className="flex justify-between pt-4 border-t">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </div>
  );
}

export default function AddMovementsPage({ params }: AddMovementsPageProps) {
  const { workoutId } = use(params);
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMovements, setSelectedMovements] = useState<Set<string>>(
    new Set()
  );
  const [initialSelectedMovements, setInitialSelectedMovements] = useState<
    Set<string>
  >(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Fetch data
  const { data: workout } = useWorkout(workoutId);
  const { data: movementTemplates = [], isLoading: templatesLoading } =
    useMovementTemplates();
  const { data: userMovements = [], isLoading: userMovementsLoading } =
    useUserMovements();
  const { data: workoutMovements = [], isLoading: workoutMovementsLoading } =
    useWorkoutMovements(workoutId);
  const { data: trackingTypes = [] } = useTrackingTypes();

  const createUserMovementMutation = useCreateUserMovement();
  const addMovementsBatch = useAddMovementsToWorkout();
  const removeMovementsBatch = useRemoveMovementsFromWorkout();

  const isLoading =
    templatesLoading || userMovementsLoading || workoutMovementsLoading;

  // Initialize selected movements from workout
  useEffect(() => {
    const ids = workoutMovements.map((wm) => wm.user_movement_id);
    const initialSet = new Set(ids);
    setSelectedMovements(initialSet);
    setInitialSelectedMovements(initialSet);
  }, [workoutMovements]);

  const filteredLibrary = useMemo(() => {
    return movementTemplates
      .filter((movement) => {
        return (
          movement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movement.muscle_groups.some((group) =>
            group.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [movementTemplates, searchTerm]);

  const filteredUserMovements = useMemo(() => {
    const workoutMovementIds = new Set(
      workoutMovements.map((wm) => wm.user_movement_id)
    );

    return userMovements
      .filter(
        (movement) =>
          movement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movement.muscle_groups?.some((group) =>
            group.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
      .sort((a, b) => {
        // Prioritize movements already in workout
        const aInWorkout = workoutMovementIds.has(a.id);
        const bInWorkout = workoutMovementIds.has(b.id);

        if (aInWorkout && !bInWorkout) return -1;
        if (!aInWorkout && bInWorkout) return 1;

        return a.name.localeCompare(b.name);
      });
  }, [userMovements, searchTerm, workoutMovements]);

  const handleMovementToggle = useCallback(
    (movementId: string) => {
      if (isSaving) return;

      setSelectedMovements((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(movementId)) {
          newSet.delete(movementId);
        } else {
          newSet.add(movementId);
        }
        return newSet;
      });
    },
    [isSaving]
  );

  const handleSave = async () => {
    setIsSaving(true);

    const movementsToAdd = Array.from(selectedMovements).filter(
      (id) => !initialSelectedMovements.has(id)
    );
    const movementsToRemove = Array.from(initialSelectedMovements).filter(
      (id) => !selectedMovements.has(id)
    );

    // Navigate back immediately for better UX
    router.push(`/workout/${workoutId}`);

    try {
      // Batch remove movements
      if (movementsToRemove.length > 0) {
        await removeMovementsBatch.mutateAsync({
          workoutId,
          movementIds: movementsToRemove,
        });
      }

      // Process movements to add
      const userMovementIds: string[] = [];

      for (const movementId of movementsToAdd) {
        const templateMovement = movementTemplates.find(
          (t) => t.id === movementId
        );
        let userMovementId = movementId;

        if (templateMovement) {
          const trackingType = trackingTypes.find(
            (tt) => tt.id === templateMovement.tracking_type_id
          );
          if (!trackingType) {
            throw new Error(
              `Unknown tracking type ID: ${templateMovement.tracking_type_id}`
            );
          }

          const newUserMovement = await createUserMovementMutation.mutateAsync({
            template_id: null,
            name: templateMovement.name,
            muscle_groups: templateMovement.muscle_groups,
            tracking_type_id: trackingType.id,
            personal_notes: templateMovement.instructions,
          });
          userMovementId = newUserMovement.id;
        }

        userMovementIds.push(userMovementId);
      }

      // Filter out movements already in workout
      const existingUserMovementIds = new Set(
        workoutMovements.map((wm) => wm.user_movement_id)
      );
      const newUserMovementIds = userMovementIds.filter(
        (id) => !existingUserMovementIds.has(id)
      );

      // Batch add movements
      if (newUserMovementIds.length > 0) {
        const startingOrderIndex = getNextOrderIndex(workoutMovements);
        const newWorkoutMovements = prepareWorkoutMovements(
          workoutId,
          newUserMovementIds,
          startingOrderIndex
        );

        const userMovementsForOptimistic = newUserMovementIds
          .map((id) => userMovements.find((um) => um.id === id))
          .filter((um): um is UserMovement => um !== undefined);

        await addMovementsBatch.mutateAsync({
          workoutMovements: newWorkoutMovements,
          userMovementsForOptimistic,
        });
      }
    } catch (error) {
      console.error("Error saving workout changes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/workout/${workoutId}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <ContextualNavigation
          context={{
            type: "workout-detail",
            workoutName: workout?.name,
          }}
        />
        <main className="p-2 sm:p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4 mt-2">
            <Typography variant="title1">Add movements</Typography>

            <Card>
              <CardContent className="p-4 sm:p-6">
                {isLoading ? (
                  <AddMovementsPageSkeleton />
                ) : (
                  <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="flex space-x-3">
                      <Input
                        type="text"
                        placeholder="Search movements..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                      />
                      <Button asChild variant="outline">
                        <Link
                          href={`/movement/new?returnTo=/workout/${workoutId}/movements&name=${encodeURIComponent(searchTerm.trim())}`}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Custom
                        </Link>
                      </Button>
                    </div>

                    {/* Movement Lists */}
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                      {/* User's Custom Movements */}
                      {filteredUserMovements.length > 0 && (
                        <div>
                          <Typography variant="caption" className="mb-2">
                            My movements
                          </Typography>
                          <div className="space-y-2">
                            {filteredUserMovements.map((movement) => (
                              <MovementListItem
                                key={movement.id}
                                movement={movement}
                                isSelected={selectedMovements.has(movement.id)}
                                isSaving={isSaving}
                                onToggle={() =>
                                  handleMovementToggle(movement.id)
                                }
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Movement Library */}
                      <div>
                        <Typography variant="caption" className="mb-2">
                          Movement Library
                        </Typography>
                        <div className="space-y-2">
                          {filteredLibrary.map((movement) => (
                            <MovementListItem
                              key={movement.id}
                              movement={movement}
                              isSelected={selectedMovements.has(movement.id)}
                              isSaving={isSaving}
                              onToggle={() => handleMovementToggle(movement.id)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {filteredLibrary.length === 0 &&
                      filteredUserMovements.length === 0 && (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">
                            No movements found matching your search.
                          </p>
                        </div>
                      )}

                    {/* Footer */}
                    <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        {selectedMovements.size} movement
                        {selectedMovements.size !== 1 ? "s" : ""} selected
                      </div>
                      <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          disabled={isSaving}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="w-full sm:w-auto"
                        >
                          {isSaving ? "Saving..." : "Done"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
