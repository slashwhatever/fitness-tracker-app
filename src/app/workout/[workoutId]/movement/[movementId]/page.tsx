"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ContextualNavigation from "@/components/common/ContextualNavigation";
import GroupedSetHistory from "@/components/common/GroupedSetHistory";
import QuickSetEntry from "@/components/common/QuickSetEntry";
import ResponsiveButton from "@/components/common/ResponsiveButton";
import { Typography } from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MovementDetailSkeleton } from "@/components/ui/skeleton-patterns";
import { useTimer } from "@/contexts/TimerContext";
import {
  useCreateSet,
  useSetsByMovement,
  useTrackingTypes,
  useUserMovement,
  useWorkout,
} from "@/hooks";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Set, UserMovement, getEffectiveRestTimer } from "@/models/types";
import { Calendar, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface MovementDetailPageProps {
  params: Promise<{ workoutId: string; movementId: string }>;
}

export default function MovementDetailPage({
  params,
}: MovementDetailPageProps) {
  const [paramsResolved, setParamsResolved] = useState<{
    workoutId: string;
    movementId: string;
  } | null>(null);
  const [isMovementInfoOpen, setIsMovementInfoOpen] = useState(false);

  // Resolve async params
  useEffect(() => {
    params.then(setParamsResolved);
  }, [params]);

  // Use our new React Query hooks
  const {
    data: movement,
    isLoading: movementLoading,
    status: movementStatus,
  } = useUserMovement(paramsResolved?.movementId || "");
  const { data: sets = [] } = useSetsByMovement(
    paramsResolved?.movementId || ""
  );

  const { data: workout, isLoading: workoutLoading } = useWorkout(
    paramsResolved?.workoutId || ""
  );
  const { data: userProfile } = useUserProfile();
  const { data: trackingTypes = [] } = useTrackingTypes();
  const createSetMutation = useCreateSet();
  const { startTimer } = useTimer();

  const handleDuplicateSet = async (originalSet: Set) => {
    try {
      await createSetMutation.mutateAsync({
        user_movement_id: originalSet.user_movement_id,
        workout_id: null, // Not part of a workout
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
        undefined, // No workout context on movement detail page
        { custom_rest_timer: movement?.custom_rest_timer || undefined }
      );

      if (duration) {
        startTimer(duration);
      }
    }
  };

  // Show loading skeleton while any queries are loading
  const loading = movementLoading || workoutLoading;

  if (loading) {
    return (
      <ProtectedRoute>
        <MovementDetailSkeleton />
      </ProtectedRoute>
    );
  }

  // Only show "not found" if we've finished fetching and there's no movement
  const hasFinishedFetching =
    movementStatus === "success" || movementStatus === "error";
  const movementNotFound = hasFinishedFetching && !movement && !movementLoading;

  if (movementNotFound) {
    return (
      <ProtectedRoute>
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
      <ContextualNavigation
        context={{
          type: "movement-detail",
          workoutId: paramsResolved?.workoutId || "",
          workoutName: workout?.name,
          movementName: movement?.name,
        }}
      />
      <main className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4">
          {/* Movement Info - Collapsible */}
          <Collapsible
            open={isMovementInfoOpen}
            onOpenChange={setIsMovementInfoOpen}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <span className="text-xl sm:text-2xl">
                  {movement?.tracking_type === "weight"
                    ? "🏋️"
                    : movement?.tracking_type === "bodyweight"
                    ? "🤸"
                    : movement?.tracking_type === "duration"
                    ? "⏱️"
                    : movement?.tracking_type === "distance"
                    ? "🏃"
                    : "💪"}
                </span>
                <Typography variant="title1" className="min-w-0 break-words">
                  {movement?.name}
                </Typography>
              </div>
              <CollapsibleTrigger asChild>
                <ResponsiveButton
                  icon={ChevronsUpDown}
                  color="primary"
                  variant="outline"
                >
                  <Typography variant="body">Movement details</Typography>
                </ResponsiveButton>
              </CollapsibleTrigger>
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
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 sm:gap-4">
            {/* Quick Log */}
            <div className="space-y-2">
              <QuickSetEntry
                movement={movement || null}
                lastSet={sets.length > 0 ? sets[0] : null}
                onQuickLog={async (setData) => {
                  if (paramsResolved?.movementId) {
                    try {
                      await createSetMutation.mutateAsync({
                        user_movement_id: paramsResolved.movementId,
                        workout_id: null,
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
    </ProtectedRoute>
  );
}
