'use client';

import DraggableMovementList from '@/components/common/DraggableMovementList';
import MovementSelectionModal from '@/components/common/MovementSelectionModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserMovement, Workout } from '@/models/types';
import { persistenceService } from '@/services/persistenceService';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workoutId = params.id as string;
  
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);

  useEffect(() => {
    const workouts = persistenceService.getWorkouts();
    const foundWorkout = workouts.find(w => w.id === workoutId);
    
    if (!foundWorkout) {
      router.push('/');
      return;
    }
    
    setWorkout(foundWorkout);
  }, [workoutId, router]);

  const handleMovementsSelected = (newMovements: UserMovement[]) => {
    if (!workout) return;

    // Add movements to the workout using proper WorkoutMovement relationship
    persistenceService.addMovementsToWorkout(workout.id, newMovements);
    
    // Force re-render by updating the workout state
    setWorkout({ ...workout });
  };

  const handleReorderMovements = (newOrder: UserMovement[]) => {
    if (!workout) return;

    // TODO: Implement proper WorkoutMovement relationship with order_index
    // For now, just save the movements individually
    newOrder.forEach(movement => {
      persistenceService.saveUserMovement(movement);
    });
  };

  const handleRemoveMovement = (movementId: string) => {
    if (!workout) return;

    // Remove movement from workout using proper WorkoutMovement relationship
    persistenceService.removeMovementFromWorkout(workout.id, movementId);
    
    // Force re-render by updating the workout state
    setWorkout({ ...workout });
  };

  if (!workout) return null;

      return (
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-4 -ml-4">
            <Link href="/" className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Dashboard</span>
            </Link>
          </Button>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl">{workout.name}</CardTitle>
                  {workout.description && (
                    <p className="text-muted-foreground mt-2">{workout.description}</p>
                  )}
                </div>
                <Button onClick={() => setIsSelectionModalOpen(true)}>
                  Add Movement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DraggableMovementList
                movements={persistenceService.getMovementsForWorkout(workout.id)}
                onReorder={handleReorderMovements}
                onRemove={handleRemoveMovement}
              />
            </CardContent>
          </Card>
        </div>

      <MovementSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onMovementsSelected={handleMovementsSelected}
      />
    </main>
  );
}
