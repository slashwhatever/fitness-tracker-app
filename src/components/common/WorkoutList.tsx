'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkouts, useDeleteWorkout, useWorkoutMovements } from '@/hooks';
import { ChevronRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { forwardRef, useImperativeHandle, useState } from 'react';

export interface WorkoutListRef {
  refreshWorkouts: () => Promise<void>;
}

const WorkoutList = forwardRef<WorkoutListRef>((props, ref) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<any>(null);

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

  const handleDeleteClick = (e: React.MouseEvent, workout: any) => {
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
      <Card>
        <CardHeader>
          <CardTitle>Your Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading workouts...</p>
            </div>
          ) : workouts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No workouts created yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Create your first workout to get started!</p>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="grid gap-3 pr-4">
                {workouts.map((workout) => (
                  <div key={workout.id} className="flex justify-between items-center p-4 bg-card border border-default rounded-lg hover:border-gray-300 transition-all cursor-pointer">

                    <Link href={`/workout/${workout.id}`} className="flex-1">
                      <div className="text-left">
                        <h4 className="text-lg font-bold text-foreground">{workout.name}</h4>
                        {workout.description && (
                          <p className="text-sm text-muted-foreground mt-1">{workout.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          <MovementCount workoutId={workout.id} />
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-center space-x-2">
                      <Link href={`/workout/${workout.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        onClick={(e) => handleDeleteClick(e, workout)}
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-red-500 h-9 w-9"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

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
