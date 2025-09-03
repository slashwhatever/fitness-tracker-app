'use client';

import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeleteWorkout, useWorkoutMovements, useWorkouts } from '@/hooks';
import { ChevronRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { Typography } from './Typography';

export interface WorkoutListRef {
  refreshWorkouts: () => Promise<void>;
}

const WorkoutList = forwardRef<WorkoutListRef>((_props, ref) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<{ id: string; name: string } | null>(null);

  // Use our new React Query hooks
  const { data: workouts = [], isLoading, refetch } = useWorkouts();
  const deleteWorkoutMutation = useDeleteWorkout();

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

  const handleDeleteClick = (e: React.MouseEvent, workout: { id: string; name: string }) => {
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
        console.error('Failed to delete workout:', error);
        // Don't close modal on error so user can retry
      }
    }
  };

  const handleCancelDelete = () => {
    setWorkoutToDelete(null);
    setShowDeleteConfirm(false);
  };

  return (
    <>
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Typography variant="title2">Your workouts</Typography>
      </div>
      
      {isLoading ? (
        <div className="grid gap-2">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-card rounded-lg border">
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
          <Typography variant="caption">Create your first workout to get started!</Typography>
        </div>
      ) : (
        <div className="grid gap-2">
          {workouts.map((workout) => (
            <div key={workout.id} className="flex items-center justify-between p-3 bg-card rounded-lg border hover:bg-muted/50 transition-all cursor-pointer">

              <Link href={`/workout/${workout.id}`} className="flex-1 min-w-0">
                <div className="text-left">
                  <Typography variant="title3">{workout.name}</Typography>
                  {workout.description && (
                    <Typography variant="caption">{workout.description}</Typography>
                  )}
                  <Typography variant="caption">
                    <MovementCount workoutId={workout.id} />
                  </Typography>
                </div>
              </Link>

              <div className="flex items-center space-x-1 ml-2">
                <Link href={`/workout/${workout.id}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8"
                  >
                    <ChevronRight  />
                  </Button>
                </Link>
                <Button
                  onClick={(e) => handleDeleteClick(e, workout)}
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-red-500 h-7 w-7 sm:h-8 sm:w-8"
                >
                  <Trash2  />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Workout"
        description={
          workoutToDelete 
            ? `Are you sure you want to delete "${workoutToDelete.name}"? This will permanently remove the workout and all its movements. This action cannot be undone.`
            : ''
        }
        confirmText="Delete Workout"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteWorkoutMutation.isPending}
      />
    </>
  );
});

WorkoutList.displayName = 'WorkoutList';

export default WorkoutList;
