'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import MovementList from '@/components/common/MovementList';
import MovementSelectionModal from '@/components/common/MovementSelectionModal';
import { Typography } from '@/components/common/Typography';
import WorkoutSettingsModal from '@/components/common/WorkoutSettingsModal';
import Loading from '@/components/Loading';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { useAddMovementToWorkout, useWorkout, useWorkoutMovements } from '@/hooks';
import { Plus, Settings } from 'lucide-react';
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
          <Loading title="Loading workout..." subtitle="Please wait while we load the workout." />
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
                <CardTitle>Workout not found</CardTitle>
                <CardDescription className="text-muted-foreground mb-4">
                  The workout you&apos;re looking for doesn&apos;t exist or has been deleted.
                </CardDescription>
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
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{workout?.name || 'Workout'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
              <div className="flex justify-between items-center space-y-2">
                <div className="flex flex-col space-y-4">
                  <Typography variant="title1" className="truncate mb-0">{workout.name}</Typography>
                  {workout.description && (
                    <Typography variant="caption" className="mt-1">{workout.description}</Typography>
                  )}
                  <Typography variant="caption" className="mt-0">
                    {workoutMovements.length} movement{workoutMovements.length !== 1 ? 's' : ''}
                  </Typography>
                </div>

                <div className="flex space-x-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowMovementModal(true)}
                    className="h-8 w-8 sm:w-auto p-0 sm:px-3 flex items-center sm:space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <Typography variant="caption" className="hidden sm:inline">Add</Typography>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowSettingsModal(true)}
                    className="h-8 w-8 sm:w-auto p-0 sm:px-3 flex items-center sm:space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <Typography variant="caption" className="hidden sm:inline">Settings</Typography>
                  </Button>
                </div>
              </div>
            </div>
            
            <MovementList
              key={refreshKey}
              workoutId={paramsResolved?.id || ''}
              onMovementAdded={handleMovementAdded}
              onAddMovementClick={() => setShowMovementModal(true)}
              expectedCount={workoutMovements.length || 2}
            />

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
