'use client';

import DraggableMovementList from '@/components/common/DraggableMovementList';
import MovementSelectionModal from '@/components/common/MovementSelectionModal';
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

    const updatedWorkout: Workout = {
      ...workout,
      userMovements: [...workout.userMovements, ...newMovements],
    };

    persistenceService.saveWorkout(updatedWorkout);
    setWorkout(updatedWorkout);
  };

  const handleReorderMovements = (newOrder: UserMovement[]) => {
    if (!workout) return;

    const updatedWorkout: Workout = {
      ...workout,
      userMovements: newOrder,
    };

    persistenceService.saveWorkout(updatedWorkout);
    setWorkout(updatedWorkout);
  };

  const handleRemoveMovement = (movementId: string) => {
    if (!workout) return;

    const updatedWorkout: Workout = {
      ...workout,
      userMovements: workout.userMovements.filter(m => m.id !== movementId),
    };

    persistenceService.saveWorkout(updatedWorkout);
    setWorkout(updatedWorkout);
  };

  if (!workout) return null;

      return (
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-primary hover:text-blue-400 mb-4 block">
            ← Back to Dashboard
          </Link>
          
          <div className="bg-card rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-card-foreground">{workout.name}</h1>
                             {workout.description && (
                 <p className="text-muted-foreground mt-2">{workout.description}</p>
               )}
            </div>
            <button
              onClick={() => setIsSelectionModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Movement
            </button>
          </div>

                     <DraggableMovementList
             movements={workout.userMovements}
             onReorder={handleReorderMovements}
             onRemove={handleRemoveMovement}
           />
        </div>
      </div>

      <MovementSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onMovementsSelected={handleMovementsSelected}
      />
    </main>
  );
}
