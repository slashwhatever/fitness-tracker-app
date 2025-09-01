'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import MovementList from '@/components/common/MovementList';
import MovementSelectionModal from '@/components/common/MovementSelectionModal';
import WorkoutSettingsModal from '@/components/common/WorkoutSettingsModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAddMovementToWorkout, useWorkout, useWorkoutMovements } from '@/hooks';
import { ArrowLeft, Plus, Settings } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface WorkoutDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function WorkoutDetailPage({ params }: WorkoutDetailPageProps) {
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [paramsResolved, setParamsResolved] = useState<{ id: string } | null>(null);
  const [addingMovements, setAddingMovements] = useState<Set<string>>(new Set());
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const addMovementToWorkoutMutation = useAddMovementToWorkout();

  // Resolve async params
  useEffect(() => {
    params.then(setParamsResolved);
  }, [params]);

  // Use our new React Query hooks
  const { data: workout, isLoading: loading } = useWorkout(paramsResolved?.id || '');
  const { data: workoutMovements = [] } = useWorkoutMovements(paramsResolved?.id || '');

  const handleMovementAdded = async (userMovementId: string) => {
    if (!paramsResolved?.id) return;
    
    // Check if movement is already in workout to avoid duplicates
    const isAlreadyInWorkout = workoutMovements.some(wm => wm.user_movement_id === userMovementId);
    if (isAlreadyInWorkout) {
      console.log('🚫 Movement already in workout, skipping');
      return;
    }
    
    if (addingMovements.has(userMovementId)) {
      console.log('🚫 Already adding this movement, skipping');
      return;
    }

    // Add to pending set immediately to prevent double-adds
    setAddingMovements(prev => new Set([...prev, userMovementId]));

    try {
      console.log('🔄 Adding movement to workout:', { userMovementId, workoutId: paramsResolved.id });
      
      await addMovementToWorkoutMutation.mutateAsync({
        workout_id: paramsResolved.id,
        user_movement_id: userMovementId,
        order_index: 0, // The mutation will handle finding the right order
      });
      
      console.log('✅ Movement added successfully');
      // Force refresh of the movements list
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('❌ Error adding movement to workout:', error);
    } finally {
      // Remove from pending set
      setAddingMovements(prev => {
        const newSet = new Set(prev);
        newSet.delete(userMovementId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-background p-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <p className="text-muted-foreground">Loading workout...</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (!workout) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-background p-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-semibold mb-2">Workout not found</h2>
                <p className="text-muted-foreground mb-4">
                  The workout you&apos;re looking for doesn&apos;t exist or has been deleted.
                </p>
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
      <main className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
          <Button variant="ghost" asChild className="-ml-2">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>
          
          <div className="p-3 sm:p-4 bg-card rounded-lg border">
            <div className="mb-4">
              <div className="flex justify-between items-start">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">{workout.name}</h1>
                <div className="flex space-x-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowMovementModal(true)}
                    className="flex items-center space-x-1 h-8"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline text-xs">Add</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowSettingsModal(true)}
                    className="flex items-center space-x-1 h-8"
                  >
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline text-xs">Settings</span>
                  </Button>
                </div>
              </div>
              {workout.description && (
                <p className="text-muted-foreground mt-1 text-sm">{workout.description}</p>
              )}
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                {workoutMovements.length} movement{workoutMovements.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <MovementList
              key={refreshKey}
              workoutId={paramsResolved?.id || ''}
              onMovementAdded={handleMovementAdded}
              onAddMovementClick={() => setShowMovementModal(true)}
            />
          </div>
        </div>

            <MovementSelectionModal
              isOpen={showMovementModal}
              onClose={() => {
                setShowMovementModal(false);
                // Force refresh when modal closes to show any changes
                setRefreshKey(prev => prev + 1);
              }}
              workoutId={paramsResolved?.id || ''}
            />

            <WorkoutSettingsModal
              isOpen={showSettingsModal}
              onClose={() => {
                setShowSettingsModal(false);
                setRefreshKey(prev => prev + 1);
              }}
              workout={workout}
              onWorkoutUpdated={() => {
                setRefreshKey(prev => prev + 1);
              }}
              onWorkoutDeleted={() => {
                setRefreshKey(prev => prev + 1);
              }}
            />
      </main>
    </ProtectedRoute>
  );
}
