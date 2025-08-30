'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Workout } from '@/models/types';
import { persistenceService } from '@/services/persistenceService';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null);

  useEffect(() => {
    // Load workouts from localStorage
    const savedWorkouts = persistenceService.getWorkouts();
    setWorkouts(savedWorkouts);
  }, []);

  const handleDeleteClick = (e: React.MouseEvent, workout: Workout) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    setWorkoutToDelete(workout);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (workoutToDelete) {
      persistenceService.deleteWorkout(workoutToDelete.id);
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
                  <div key={workout.id} className="relative group">
                    <Button 
                      variant="outline" 
                      asChild 
                      className="h-auto p-4 justify-start w-full"
                    >
                      <Link href={`/workout/${workout.id}`}>
                        <div className="flex justify-between items-start w-full">
                          <div className="flex-1 text-left">
                            <h4 className="font-medium">{workout.name}</h4>
                            {workout.description && (
                              <p className="text-sm text-muted-foreground mt-1">{workout.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {persistenceService.getMovementCountForWorkout(workout.id)} movements • Created {new Date(workout.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-muted-foreground ml-4">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </Button>
                    
                    {/* Delete Button - appears on hover */}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => handleDeleteClick(e, workout)}
                      aria-label={`Delete ${workout.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
      />
    </>
  );
}
