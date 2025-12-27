"use client";

import { useTimer } from "@/contexts/TimerContext";
import { useUserMovement, useWorkoutMovements } from "@/hooks/useMovements";
import { useCreateSet, useSetsByMovement } from "@/hooks/useSets";
import { useTrackingTypes } from "@/hooks/useTrackingTypes";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useWorkout } from "@/hooks/useWorkouts";
import { getTrackingTypeIcon } from "@/lib/utils/typeHelpers";
import { Set, UserMovement, getEffectiveRestTimer } from "@/models/types";
import ContextualNavigation from "@components/common/ContextualNavigation";
import GroupedSetHistory from "@components/common/GroupedSetHistory";
import QuickSetEntry from "@components/common/QuickSetEntry";
import ResponsiveButton from "@components/common/ResponsiveButton";
import { Typography } from "@components/common/Typography";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@components/ui/collapsible";
import { MovementDetailSkeleton } from "@components/ui/skeleton-patterns";
import { Calendar, ChevronsUpDown, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface MovementDetailProps {
  movementId: string;
  workoutId?: string; // Optional - for workout context
  returnPath: string; // Where to navigate back to
  returnLabel: string; // Label for the return button
  isQuickLog?: boolean; // Whether this is a quick log from dashboard
}

export default function MovementDetail({
  movementId,
  workoutId,
  returnPath,
  returnLabel,
  isQuickLog = false,
}: MovementDetailProps) {
  const [isMovementInfoOpen, setIsMovementInfoOpen] = useState(false);

  // Use our React Query hooks
  const {
    data: movement,
    isLoading: movementLoading,
    status: movementStatus,
  } = useUserMovement(movementId);
  const { data: sets = [] } = useSetsByMovement(movementId);

  const { data: workout, isLoading: workoutLoading } = useWorkout(
    workoutId || ""
  );
  const { data: workoutMovements = [] } = useWorkoutMovements(workoutId || "");
  const { data: userProfile } = useUserProfile();
  const { data: trackingTypes = [] } = useTrackingTypes();
  const createSetMutation = useCreateSet();
  const { startTimer } = useTimer();

  // Find the workout_movement entry to get workout-specific notes
  const workoutMovement = workoutMovements.find(
    (wm) => wm.user_movement_id === movementId
  );

  const handleDuplicateSet = async (originalSet: Set) => {
    try {
      await createSetMutation.mutateAsync({
        user_movement_id: originalSet.user_movement_id,
        workout_id: workoutId || null, // Use workout context if available
        set_type: originalSet.set_type || "working",
        reps: originalSet.reps,
        weight: originalSet.weight,
        duration: originalSet.duration,
        distance: originalSet.distance,
        notes: originalSet.notes,
      });
      // Start rest timer after duplicating a set
      startRestTimerWithSettings();
    } catch (error) {
      console.error("Failed to duplicate set:", error);
    }
  };

  const startRestTimerWithSettings = () => {
    if (userProfile && movement) {
      const duration = getEffectiveRestTimer(
        { default_rest_timer: userProfile.default_rest_timer || undefined },
        workoutId
          ? { default_rest_timer: workout?.default_rest_timer || undefined }
          : undefined,
        { custom_rest_timer: movement?.custom_rest_timer || undefined }
      );

      if (duration) {
        startTimer(duration);
      }
    }
  };

  // Show loading skeleton while any queries are loading
  const loading = movementLoading || (workoutId && workoutLoading);

  if (loading) {
    return <MovementDetailSkeleton />;
  }

  // Only show "not found" if we've finished fetching and there's no movement
  const hasFinishedFetching =
    movementStatus === "success" || movementStatus === "error";
  const movementNotFound = hasFinishedFetching && !movement && !movementLoading;

  if (movementNotFound) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Typography variant="title2">Movement not found</Typography>
              <Typography variant="caption">
                The movement you&apos;re looking for doesn&apos;t exist or has
                been deleted.
              </Typography>
              <Button asChild>
                <Link href={returnPath}>{returnLabel}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ContextualNavigation
        context={
          workoutId
            ? {
                type: "movement-detail",
                workoutId,
                workoutName: workout?.name,
                movementName: movement?.name,
              }
            : isQuickLog
              ? {
                  type: "quick-log-movement-detail",
                  movementName: movement?.name,
                }
              : {
                  type: "library-movement-detail",
                  movementName: movement?.name,
                }
        }
      />
      <main className="p-2 sm:p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4 mt-2">
          {/* Movement Info - Collapsible */}
          <Collapsible
            open={isMovementInfoOpen}
            onOpenChange={setIsMovementInfoOpen}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                {movement?.tracking_type &&
                  getTrackingTypeIcon(movement.tracking_type, 24)}
                <Typography variant="title1" className="min-w-0 break-words">
                  {movement?.name}
                </Typography>
              </div>
              <div className="flex space-x-2">
                <CollapsibleTrigger asChild>
                  <ResponsiveButton
                    icon={ChevronsUpDown}
                    color="primary"
                    variant="outline"
                  >
                    <Typography variant="body">Details</Typography>
                  </ResponsiveButton>
                </CollapsibleTrigger>
                <Link
                  href={
                    workoutId
                      ? `/workout/${workoutId}/movement/${movementId}/settings`
                      : `/library/movement/${movementId}/settings`
                  }
                >
                  <ResponsiveButton
                    icon={Settings}
                    color="primary"
                    variant="outline"
                  >
                    <Typography variant="body">Settings</Typography>
                  </ResponsiveButton>
                </Link>
              </div>
            </div>
            <CollapsibleContent className="space-y-1">
              <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                <Typography variant="caption">
                  Muscle groups:{" "}
                  {movement?.muscle_groups?.join(", ") || "Unknown"}
                </Typography>
                <Typography variant="caption">
                  Tracking type:{" "}
                  {trackingTypes.find(
                    (tt) => tt.name === movement?.tracking_type
                  )?.display_name || movement?.tracking_type}
                </Typography>
                {movement?.custom_rest_timer && (
                  <Typography variant="caption">
                    Custom rest timer: {movement?.custom_rest_timer}s
                  </Typography>
                )}
                {movement?.personal_notes && (
                  <Typography variant="caption" className="break-words">
                    Notes: {movement?.personal_notes}
                  </Typography>
                )}
                {workoutMovement?.workout_notes && (
                  <Typography variant="caption" className="break-words">
                    Workout notes: {workoutMovement?.workout_notes}
                  </Typography>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 sm:gap-4">
            {/* Quick Log */}
            <div className="space-y-2">
              {!workoutId && (
                <Typography variant="title2">Log a set</Typography>
              )}
              <QuickSetEntry
                movement={movement || null}
                lastSet={sets.length > 0 ? sets[0] : null}
                onQuickLog={async (setData) => {
                  if (movementId) {
                    try {
                      await createSetMutation.mutateAsync({
                        user_movement_id: movementId,
                        workout_id: workoutId || null,
                        reps: setData.reps || null,
                        weight: setData.weight || null,
                        duration: setData.duration || null,
                        distance: setData.distance || null,
                        notes: setData.notes || null,
                        set_type: "working",
                      });
                      // Start rest timer after successfully logging a set
                      startRestTimerWithSettings();
                    } catch (error) {
                      console.error("Failed to save set:", error);
                    }
                  }
                }}
              />
            </div>

            {/* Personal Records */}
            {/* <PRSummary userMovementId={movement?.id} /> */}
          </div>

          {/* Set History */}
          <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4">
            <div className="flex items-center space-x-2 px-1">
              <Calendar className="w-4 h-4" />
              <Typography variant="title2">Set history</Typography>
            </div>
            <GroupedSetHistory
              sets={sets}
              movement={movement as UserMovement}
              onDuplicate={handleDuplicateSet}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
