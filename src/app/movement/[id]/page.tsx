'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import EditableSet from '@/components/common/EditableSet';
import PRSummary from '@/components/common/PRSummary';
import QuickSetEntry from '@/components/common/QuickSetEntry';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCreateSet, useSetsByMovement, useUserMovement } from '@/hooks';
import { LastSet, UserMovement } from '@/models/types';
import { ArrowLeft, Calendar, Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface MovementDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MovementDetailPage({ params }: MovementDetailPageProps) {
  const [paramsResolved, setParamsResolved] = useState<{ id: string } | null>(null);
  const [weightUnit] = useState<string>('lbs');

  // Resolve async params
  useEffect(() => {
    params.then(setParamsResolved);
  }, [params]);

  // Use our new React Query hooks
  const { data: movement, isLoading: movementLoading } = useUserMovement(paramsResolved?.id || '');
  const { data: sets = [] } = useSetsByMovement(paramsResolved?.id || '');
  const createSetMutation = useCreateSet();

  const handleDuplicateSet = async (originalSet: any) => {
    try {
      await createSetMutation.mutateAsync({
        user_movement_id: originalSet.user_movement_id,
        workout_id: null, // Not part of a workout
        set_type: originalSet.set_type,
        reps: originalSet.reps,
        weight: originalSet.weight,
        duration: originalSet.duration,
        distance: originalSet.distance,
        notes: originalSet.notes,
      });
    } catch (error) {
      console.error('Failed to duplicate set:', error);
    }
  };

  const loading = movementLoading || !movement;

  // TODO: Implement weight unit preferences with React Query hooks
  // useEffect(() => {
  //   if (user?.id) {
  //     () => Promise.resolve("mock")(user.id).then(setWeightUnit);
  //   }
  // }, [user?.id]);

  const formatWeight = (weight: number | null | undefined) => {
    if (!weight) return 'N/A';
    return `${weight} ${weightUnit}`;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-background p-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <p className="text-muted-foreground">Loading movement details...</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (!movement) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-background p-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-semibold mb-2">Movement not found</h2>
                <p className="text-muted-foreground mb-4">
                  The movement you&apos;re looking for doesn&apos;t exist or has been deleted.
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
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Link>
            </Button>
          </div>

          {/* Movement Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <span className="text-2xl">
                  {movement.tracking_type === 'weight' ? '🏋️' : 
                   movement.tracking_type === 'bodyweight' ? '🤸' :
                   movement.tracking_type === 'duration' ? '⏱️' :
                   movement.tracking_type === 'distance' ? '🏃' : '💪'}
                </span>
                <span>{movement.name}</span>
              </CardTitle>
              <CardDescription>
                <div className="space-y-2">
                  <div>
                    <strong>Muscle Groups:</strong> {movement.muscle_groups?.join(', ') || 'Unknown'}
                  </div>
                  <div>
                    <strong>Tracking Type:</strong> {movement.tracking_type}
                  </div>
                  {movement.personal_notes && (
                    <div>
                      <strong>Notes:</strong> {movement.personal_notes}
                    </div>
                  )}
                </div>
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Log */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Dumbbell className="w-5 h-5" />
                  <span>Quick Log</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuickSetEntry 
                  movement={movement}
                  lastSet={sets[0] as LastSet}
                  onQuickLog={async (setData) => {
                    if (movement?.id) {
                      try {
                        await createSetMutation.mutateAsync({
                          user_movement_id: movement.id,
                          workout_id: null,
                          reps: setData.reps || null,
                          weight: setData.weight || null,
                          duration: setData.duration || null,
                          distance: setData.distance || null,
                          notes: setData.notes || null,
                          set_type: 'working',
                        });
                      } catch (error) {
                        console.error('Failed to save set:', error);
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Personal Records */}
            <PRSummary userMovementId={movement.id} />
          </div>

          {/* Set History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Set History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No sets logged for this movement yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">Use the quick log above to record your first set!</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3 pr-4">
                    {sets.map((set) => (
                      <EditableSet
                        key={set.id}
                        set={set}
                        movement={movement as UserMovement}
                        onDuplicate={handleDuplicateSet}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </ProtectedRoute>
  );
}
