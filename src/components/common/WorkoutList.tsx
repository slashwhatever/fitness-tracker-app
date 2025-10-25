"use client";

import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteWorkout,
  useReorderWorkouts,
  useWorkouts,
} from "@/hooks/useWorkouts";
import { useWorkoutMovementCounts } from "@/hooks/useWorkoutMovementCounts";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import SortableWorkoutItem from "./SortableWorkoutItem";
import { Typography } from "./Typography";

export interface WorkoutListRef {
  refreshWorkouts: () => Promise<void>;
}

const WorkoutList = forwardRef<WorkoutListRef>((_props, ref) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Use our new React Query hooks
  const { data: workouts = [], isLoading, refetch } = useWorkouts();
  const deleteWorkoutMutation = useDeleteWorkout();
  const reorderMutation = useReorderWorkouts();
  const queryClient = useQueryClient();

  // Drag and drop sensors for both mouse and touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100, // Shorter delay for better responsiveness
        tolerance: 8, // Larger tolerance to prevent accidental drags while scrolling
      },
    })
  );

  // Get workout IDs for efficient movement count lookup
  const workoutIds = workouts.map((w) => w.id);
  const { data: movementCountsData = [] } =
    useWorkoutMovementCounts(workoutIds);

  // Expose refresh function to parent
  useImperativeHandle(ref, () => ({
    refreshWorkouts: async () => {
      // Invalidate movement counts cache to force refresh
      queryClient.invalidateQueries({
        queryKey: ["workout-movement-counts"],
      });
      await refetch();
    },
  }));

  const handleDeleteClick = (
    e: React.MouseEvent,
    workout: { id: string; name: string }
  ) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    setWorkoutToDelete(workout);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (workoutToDelete) {
      try {
        await deleteWorkoutMutation.mutateAsync(workoutToDelete.id);
        setWorkoutToDelete(null);
        setShowDeleteConfirm(false);
      } catch (error) {
        console.error("Failed to delete workout:", error);
        // Don't close modal on error so user can retry
      }
    }
  };

  const handleCancelDelete = () => {
    setWorkoutToDelete(null);
    setShowDeleteConfirm(false);
  };

  // Prefetch workout details and movements on hover for better UX
  const prefetchWorkoutData = useCallback(
    async (workoutId: string) => {
      try {
        // Prefetch workout details
        await queryClient.prefetchQuery({
          queryKey: ["workouts", "detail", workoutId],
          queryFn: async () => {
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            const { data } = await supabase
              .from("workouts")
              .select("*")
              .eq("id", workoutId)
              .single();
            return data;
          },
          staleTime: 5 * 60 * 1000,
        });
      } catch (error) {
        // Prefetch errors are non-critical
        console.debug("Prefetch failed for workout:", workoutId, error);
      }
    },
    [queryClient]
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = workouts.findIndex((workout) => workout.id === active.id);
    const newIndex = workouts.findIndex((workout) => workout.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Create the reordered array
    const reorderedWorkouts = arrayMove(workouts, oldIndex, newIndex);

    // Update order_index for all affected workouts
    const updatedWorkouts = reorderedWorkouts.map((workout, index) => ({
      id: workout.id,
      order_index: index,
    }));

    try {
      await reorderMutation.mutateAsync({
        workouts: updatedWorkouts,
      });
    } catch (error) {
      console.error("Failed to reorder workouts:", error);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Typography variant="title2">Your workouts</Typography>
        </div>

        {isLoading ? (
          <div className="grid gap-2">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-card rounded-lg border"
              >
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-48 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded" />
                  <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-6 p-4 bg-muted/30 rounded-lg border-dashed border">
            <Typography variant="body">No workouts created yet.</Typography>
            <Typography variant="caption">
              Create your first workout to get started!
            </Typography>
          </div>
        ) : (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="bg-card border border-default rounded-lg overflow-hidden select-none">
              <SortableContext
                items={workouts.map((w) => w.id)}
                strategy={verticalListSortingStrategy}
              >
                {workouts.map((workout, index) => {
                  const countData = movementCountsData.find(
                    (data) => data.workout_id === workout.id
                  );
                  const movementCount = countData?.movement_count || 0;

                  return (
                    <SortableWorkoutItem
                      key={workout.id}
                      workout={workout}
                      movementCount={movementCount}
                      onDelete={(e) => handleDeleteClick(e, workout)}
                      onMouseEnter={() => prefetchWorkoutData(workout.id)}
                      showSeparator={index < workouts.length - 1}
                    />
                  );
                })}
              </SortableContext>
            </div>
          </DndContext>
        )}
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete workout"
        description={
          workoutToDelete
            ? `Are you sure you want to delete "${workoutToDelete.name}"? This will permanently remove the workout and all its movements. This action cannot be undone.`
            : ""
        }
        confirmText="Delete workout"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteWorkoutMutation.isPending}
      />
    </>
  );
});

WorkoutList.displayName = "WorkoutList";

export default WorkoutList;
