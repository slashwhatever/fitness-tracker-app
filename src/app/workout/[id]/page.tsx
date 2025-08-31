'use client';

import DraggableMovementList from '@/components/common/DraggableMovementList';
import MovementSelectionModal from '@/components/common/MovementSelectionModal';
import WorkoutSettingsModal from '@/components/common/WorkoutSettingsModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HybridStorageManager } from '@/lib/storage/HybridStorageManager';
import { UserMovement, Workout } from '@/models/types';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workoutId = params.id as string;
  
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [movements, setMovements] = useState<UserMovement[]>([]);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Helper function to reload movements from storage
  const reloadMovements = async () => {
    if (!workout) return;
    
    const workoutMovements = await HybridStorageManager.getLocalRecords<{id: string, workout_id: string, user_movement_id: string}>('workout_movements', {
      workout_id: workout.id
    });
    
    const userMovements: UserMovement[] = [];
    for (const wm of workoutMovements) {
      const movement = await HybridStorageManager.getLocalRecord<UserMovement>('user_movements', wm.user_movement_id);
      if (movement) {
        userMovements.push(movement);
      }
    }
    setMovements(userMovements);
  };

  useEffect(() => {
    const loadWorkoutData = async () => {
      const workouts = await HybridStorageManager.getLocalRecords<Workout>('workouts');
      const foundWorkout = workouts.find(w => w.id === workoutId);
      
      if (!foundWorkout) {
        router.push('/');
        return;
      }
      
      setWorkout(foundWorkout);
      
      // Get workout_movement relationships
      const workoutMovements = await HybridStorageManager.getLocalRecords<{id: string, workout_id: string, user_movement_id: string}>('workout_movements', {
        workout_id: workoutId
      });
      
      // Get the actual UserMovement objects
      const userMovements: UserMovement[] = [];
      for (const wm of workoutMovements) {
        const movement = await HybridStorageManager.getLocalRecord<UserMovement>('user_movements', wm.user_movement_id);
        if (movement) {
          userMovements.push(movement);
        }
      }
      
      setMovements(userMovements);
    };
    
    loadWorkoutData();
  }, [workoutId, router]);

  const handleMovementAdded = (movement: UserMovement) => {
    if (!workout) return;

    // Save the user movement first, then create relationship
    HybridStorageManager.saveRecord('user_movements', movement).then(() => {
      const workoutMovement = {
        id: crypto.randomUUID(),
        workout_id: workout.id,
        user_movement_id: movement.id,
        order_index: movements.length,
        created_at: new Date().toISOString(),
      };
      
      return HybridStorageManager.saveRecord('workout_movements', workoutMovement);
    }).then(() => {
      // Reload movements from storage
      reloadMovements();
    }).catch(error => {
      console.error('Failed to add movement:', error);
    });
  };

  const handleMovementRemovedFromModal = (movementId: string) => {
    if (!workout) return;

    // Find and delete the workout_movement relationship
    HybridStorageManager.getLocalRecords<{id: string, workout_id: string, user_movement_id: string}>('workout_movements', {
      workout_id: workout.id,
      user_movement_id: movementId
    }).then(workoutMovements => {
      const deletePromises = workoutMovements.map(wm => 
        HybridStorageManager.deleteRecord('workout_movements', wm.id)
      );
      return Promise.all(deletePromises);
    }).then(() => {
      // Reload movements from storage
      reloadMovements();
    }).catch(error => {
      console.error('Failed to remove movement:', error);
    });
  };

  const handleWorkoutUpdated = (updatedWorkout: Workout) => {
    setWorkout(updatedWorkout);
    setIsSettingsModalOpen(false);
  };

  const handleWorkoutDeleted = () => {
    // Navigate back to home page after deletion
    router.push('/');
  };

  const handleRemoveMovement = (movementId: string) => {
    if (!workout) return;

    // Find and delete the workout_movement relationship
    HybridStorageManager.getLocalRecords<{id: string, workout_id: string, user_movement_id: string}>('workout_movements', {
      workout_id: workout.id,
      user_movement_id: movementId
    }).then(workoutMovements => {
      const deletePromises = workoutMovements.map(wm => 
        HybridStorageManager.deleteRecord('workout_movements', wm.id)
      );
      return Promise.all(deletePromises);
    }).then(() => {
      // Reload movements from storage
      reloadMovements();
    }).catch(error => {
      console.error('Failed to remove movement:', error);
    });
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
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setIsSettingsModalOpen(true)}
                  >
                    <Settings />
                  </Button>
                  <Button onClick={() => setIsSelectionModalOpen(true)}>
                    Add Movement
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DraggableMovementList
                movements={movements}
                onRemove={handleRemoveMovement}
              />
            </CardContent>
          </Card>
        </div>

      <MovementSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        currentMovements={movements}
        onMovementAdded={handleMovementAdded}
        onMovementRemoved={handleMovementRemovedFromModal}
      />

      <WorkoutSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        workout={workout}
        onWorkoutUpdated={handleWorkoutUpdated}
        onWorkoutDeleted={handleWorkoutDeleted}
      />
    </main>
  );
}
