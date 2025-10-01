"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ContextualNavigation from "@/components/common/ContextualNavigation";
import MovementList from "@/components/common/MovementList";
import WorkoutErrorBoundary from "@/components/common/WorkoutErrorBoundary";
import WorkoutHeader from "@/components/common/WorkoutHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  useAddMovementToWorkout,
  useWorkout,
  useWorkoutMovements,
} from "@/hooks";
import Link from "next/link";
import { lazy, Suspense, useEffect, useState } from "react";

const MovementSelectionModal = lazy(() => import("@/components/common/MovementSelectionModal"));
const WorkoutSettingsModal = lazy(() => import("@/components/common/WorkoutSettingsModal"));

interface WorkoutDetailPageProps {
  params: Promise<{ workoutId: string }>;
}

export default function WorkoutDetailPage({ params }: WorkoutDetailPageProps) {
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [paramsResolved, setParamsResolved] = useState<{
    workoutId: string;
  } | null>(null);
  const [addingMovements, setAddingMovements] = useState<Set<string>>(
    new Set()
  );
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const addMovementToWorkoutMutation = useAddMovementToWorkout();

  // Resolve async params
  useEffect(() => {
    params.then(setParamsResolved);
  }, [params]);

  // Use our new React Query hooks
  const {
    data: workout,
    isLoading: workoutLoading,
    status: workoutStatus,
  } = useWorkout(paramsResolved?.workoutId || "");
  const { data: workoutMovements = [] } = useWorkoutMovements(
    paramsResolved?.workoutId || ""
  );

  const handleMovementAdded = async (userMovementId: string) => {
    if (!paramsResolved?.workoutId) return;

    // Check if movement is already in workout to avoid duplicates
    const isAlreadyInWorkout = workoutMovements.some(
      (wm) => wm.user_movement_id === userMovementId
    );
    if (isAlreadyInWorkout) {
      return;
    }

    if (addingMovements.has(userMovementId)) {
      return;
    }

    // Add to pending set immediately to prevent double-adds
    setAddingMovements((prev) => new Set([...prev, userMovementId]));

    try {
      await addMovementToWorkoutMutation.mutateAsync({
        workout_id: paramsResolved.workoutId,
        user_movement_id: userMovementId,
        order_index: 0, // The mutation will handle finding the right order
      });
      // React Query will automatically update the cache
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error adding movement to workout:", error);
      }
    } finally {
      // Remove from pending set
      setAddingMovements((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userMovementId);
        return newSet;
      });
    }
  };

  // Only show "not found" if we've finished fetching and there's no workout
  // Don't show it during loading or if we haven't attempted to fetch yet
  const hasFinishedFetching =
    workoutStatus === "success" || workoutStatus === "error";
  const workoutNotFound = hasFinishedFetching && !workout && !workoutLoading;

  if (workoutNotFound) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-background p-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <CardTitle>Workout not found</CardTitle>
                <CardDescription className="text-muted-foreground mb-4">
                  The workout you&apos;re looking for doesn&apos;t exist or has
                  been deleted.
                </CardDescription>
                <Button asChild>
                  <Link href="/">Return to Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

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
          <WorkoutErrorBoundary workoutId={paramsResolved?.workoutId}>
            <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4 mt-2">
            <WorkoutHeader
              workout={workout}
              isLoading={workoutLoading}
              movementCount={workoutMovements.length}
              onAddMovement={() => setShowMovementModal(true)}
              onSettings={() => setShowSettingsModal(true)}
            />

            <MovementList
              workoutId={paramsResolved?.workoutId || ""}
              onMovementAdded={handleMovementAdded}
              onAddMovementClick={() => setShowMovementModal(true)}
              expectedCount={workoutMovements.length || 2}
            />

            {showMovementModal && (
              <Suspense fallback={<div className="fixed inset-0 bg-black/20 flex items-center justify-center"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div></div>}>
                <MovementSelectionModal
                  isOpen={showMovementModal}
                  onClose={() => {
                    setShowMovementModal(false);
                  }}
                  workoutId={paramsResolved?.workoutId || ""}
                />
              </Suspense>
            )}

            {workout && showSettingsModal && (
              <Suspense fallback={<div className="fixed inset-0 bg-black/20 flex items-center justify-center"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div></div>}>
                <WorkoutSettingsModal
                  isOpen={showSettingsModal}
                  onClose={() => {
                    setShowSettingsModal(false);
                  }}
                  workout={workout}
                  onWorkoutUpdated={() => {
                    // React Query will automatically update the cache
                  }}
                  onWorkoutDeleted={() => {
                    // React Query will automatically update the cache
                  }}
                />
              </Suspense>
            )}
            </div>
          </WorkoutErrorBoundary>
        </main>
      </div>
    </ProtectedRoute>
  );
}
