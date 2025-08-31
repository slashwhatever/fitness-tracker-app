'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HybridStorageManager } from '@/lib/storage/HybridStorageManager';
import { Workout } from '@/models/types';
import { ChevronRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null);
  const [movementCounts, setMovementCounts] = useState<Record<string, number>>({});

  const getMovementCount = (workoutId: string): number => {
    return movementCounts[workoutId] || 0;
  };

  useEffect(() => {
    // Load workouts from storage
    const loadWorkouts = async () => {
      const savedWorkouts = await HybridStorageManager.getLocalRecords<Workout>('workouts');
      setWorkouts(savedWorkouts);
      
      // Load movement counts for each workout
      const counts: Record<string, number> = {};
      for (const workout of savedWorkouts) {
        const workoutMovements = await HybridStorageManager.getLocalRecords('workout_movements', {
          workout_id: workout.id
        });
        counts[workout.id] = workoutMovements.length;
      }
      setMovementCounts(counts);
    };
    loadWorkouts();
  }, []);

  const handleDeleteClick = (e: React.MouseEvent, workout: Workout) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    setWorkoutToDelete(workout);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (workoutToDelete) {
      await HybridStorageManager.deleteRecord('workouts', workoutToDelete.id);
      setWorkouts(workouts.filter(w => w.id !== workoutToDelete.id));
      setWorkoutToDelete(null);
    }
    setShowDeleteConfirm(false);
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
          {workouts.length === 0 ? (
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
                          {getMovementCount(workout.id)} movements
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
      />
    </>
  );
}
