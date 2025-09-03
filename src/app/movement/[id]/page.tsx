'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import EditableSet from '@/components/common/EditableSet';
import QuickSetEntry from '@/components/common/QuickSetEntry';
import RestTimer from '@/components/common/RestTimer';
import { Typography } from '@/components/common/Typography';
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
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCreateSet, useSetsByMovement, useUserMovement } from '@/hooks';
import { useUserProfile } from '@/hooks/useUserProfile';
import { LastSet, Set, UserMovement, getEffectiveRestTimer } from '@/models/types';
import { Calendar, Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface MovementDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MovementDetailPage({ params }: MovementDetailPageProps) {
  const [paramsResolved, setParamsResolved] = useState<{ id: string } | null>(null);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [restTimerDuration, setRestTimerDuration] = useState(90); // Default 90 seconds

  // Resolve async params
  useEffect(() => {
    params.then(setParamsResolved);
  }, [params]);

  // Use our new React Query hooks
  const { data: movement, isLoading: movementLoading } = useUserMovement(paramsResolved?.id || '');
  const { data: sets = [] } = useSetsByMovement(paramsResolved?.id || '');
  const { data: userProfile } = useUserProfile();
  const createSetMutation = useCreateSet();

  const handleDuplicateSet = async (originalSet: Set) => {
    try {
      await createSetMutation.mutateAsync({
        user_movement_id: originalSet.user_movement_id,
        workout_id: null, // Not part of a workout
        set_type: originalSet.set_type || 'working',
        reps: originalSet.reps,
        weight: originalSet.weight,
        duration: originalSet.duration,
        distance: originalSet.distance,
        notes: originalSet.notes,
      });
      // Start rest timer after duplicating a set
      startRestTimer();
    } catch (error) {
      console.error('Failed to duplicate set:', error);
    }
  };

  const startRestTimer = () => {
    if (userProfile && movement) {
      const duration = getEffectiveRestTimer(
        { default_rest_timer: userProfile.default_rest_timer || undefined },
        undefined, // No workout context on movement detail page
        { custom_rest_timer: movement.custom_rest_timer || undefined }
      );
      
      if (duration) {
        setRestTimerDuration(duration);
        setIsRestTimerActive(true);
      }
    }
  };

  const handleRestTimerComplete = () => {
    // Timer completed, just deactivate it
    setIsRestTimerActive(false);
  };

  const handleRestTimerSkip = () => {
    setIsRestTimerActive(false);
  };

  const loading = movementLoading || !movement;

  // TODO: Implement weight unit preferences with React Query hooks
  // useEffect(() => {
  //   if (user?.id) {
  //     () => Promise.resolve("mock")(user.id).then(setWeightUnit);
  //   }
  // }, [user?.id]);


  if (loading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-background p-8">
          <Loading title="Loading movement details..." subtitle="Please wait while we load the movement details." />
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
                <Typography variant="title2">Movement not found</Typography>
                <Typography variant="caption">
                  The movement you&apos;re looking for doesn&apos;t exist or has been deleted.
                </Typography>
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
          {/* Header */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{movement?.name || 'Movement'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Movement Info */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3 mb-3 ">
              <span className="text-xl sm:text-2xl">
                {movement.tracking_type === 'weight' ? '🏋️' : 
                 movement.tracking_type === 'bodyweight' ? '🤸' :
                 movement.tracking_type === 'duration' ? '⏱️' :
                 movement.tracking_type === 'distance' ? '🏃' : '💪'}
              </span>
              <Typography variant="title1" className="min-w-0 break-words">{movement.name}</Typography>
            </div>
            <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                <Typography variant="caption">Muscle groups: {movement.muscle_groups?.join(', ') || 'Unknown'}</Typography>
                <Typography variant="caption">Tracking type: {movement.tracking_type}</Typography>
              {movement.personal_notes && (
                <>  
                  <Typography variant="caption" className="break-words">Notes: {movement.personal_notes}</Typography>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 sm:gap-4">
            {/* Quick Log */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 px-1">
                <Dumbbell className="w-4 h-4" />
                <Typography variant="title2">Quick Log</Typography>
              </div>
              <QuickSetEntry 
                movement={movement}
                lastSet={sets.length > 0 ? sets[0] as LastSet : null}
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
                      // Start rest timer after successfully logging a set
                      startRestTimer();
                    } catch (error) {
                      console.error('Failed to save set:', error);
                    }
                  }
                }}
              />
            </div>

            {/* Personal Records */}
            {/* <PRSummary userMovementId={movement.id} /> */}
          </div>

          {/* Rest Timer */}
          {isRestTimerActive && (
            <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
              <RestTimer
                isActive={isRestTimerActive}
                duration={restTimerDuration}
                onComplete={handleRestTimerComplete}
                onSkip={handleRestTimerSkip}
              />
            </div>
          )}

          {/* Set History */}
          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-2 px-1">
              <Calendar className="w-4 h-4" />
              <Typography variant="title2">Set History</Typography>
            </div>
            {sets.length === 0 ? (
              <div className="text-center py-6 p-4 bg-muted/30 rounded-lg border-dashed border">
                <Typography variant="caption">No sets logged for this movement yet.</Typography>
                <Typography variant="footnote">Use the quick log above to record your first set!</Typography>
              </div>
            ) : (
              <ScrollArea className="h-80 sm:h-96">
                <div className="space-y-2 pr-2 sm:pr-4">
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
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
