"use client";

import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteWorkout, useWorkoutMovements, useWorkouts } from "@/hooks";
import { Separator } from "@radix-ui/react-separator";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import ResponsiveButton from "./ResponsiveButton";
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
  const queryClient = useQueryClient();

  // Simple component for showing movement count
  function MovementCount({ workoutId }: { workoutId: string }) {
    const { data: movements = [] } = useWorkoutMovements(workoutId);
    return <span>{movements.length} movements</span>;
  }

  // Expose refresh function to parent
  useImperativeHandle(ref, () => ({
    refreshWorkouts: async () => {
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
          <div className="bg-card border border-default rounded-lg overflow-hidden">
            {workouts.map((workout, index) => (
              <div key={workout.id}>
                <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-all cursor-pointer">
                  <Link
                    href={`/workout/${workout.id}`}
                    className="flex-1 min-w-0"
                    onMouseEnter={() => prefetchWorkoutData(workout.id)}
                  >
                    <div className="text-left">
                      <Typography variant="title3">{workout.name}</Typography>
                      {workout.description && (
                        <Typography variant="caption">
                          {workout.description}
                        </Typography>
                      )}
                      <Typography variant="caption">
                        <MovementCount workoutId={workout.id} />
                      </Typography>
                    </div>
                  </Link>

                  <div className="flex items-center space-x-1 ml-2">
                    <Link href={`/workout/${workout.id}`}>
                      <ResponsiveButton icon={ChevronRight} color="blue">
                        <Typography variant="body">View</Typography>
                      </ResponsiveButton>
                    </Link>
                    <ResponsiveButton
                      onClick={(e) => handleDeleteClick(e, workout)}
                      icon={Trash2}
                      color="red"
                    >
                      <Typography variant="body">Delete</Typography>
                    </ResponsiveButton>
                  </div>
                </div>
                {index < workouts.length - 1 && <Separator />}
              </div>
            ))}
          </div>
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
