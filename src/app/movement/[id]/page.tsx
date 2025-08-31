'use client';

import EditableSet from '@/components/common/EditableSet';
import QuickSetEntry from '@/components/common/QuickSetEntry';
import RestTimer from '@/components/common/RestTimer';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Set, UserMovement } from '@/models/types';
import { persistenceService } from '@/services/persistenceService';
import { format1RM, getBest1RM } from '@/utils/oneRepMax';
import { formatWeight } from '@/utils/userPreferences';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function MovementTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const movementId = params.id as string;
  
  const [movement, setMovement] = useState<UserMovement | null>(null);
  const [sets, setSets] = useState<Set[]>([]);
  
  // Current set form state

  
  // Rest timer state
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [customRestTime, setCustomRestTime] = useState<number>(0);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [setToDelete, setSetToDelete] = useState<Set | null>(null);

  useEffect(() => {
    // Find the movement across all workouts
    const allWorkouts = persistenceService.getWorkouts();
    let foundMovement: UserMovement | null = null;
    
    for (const workout of allWorkouts) {
      const workoutMovements = persistenceService.getMovementsForWorkout(workout.id);
      const foundInWorkout = workoutMovements.find(m => m.id === movementId);
      if (foundInWorkout) {
        foundMovement = foundInWorkout;
        break;
      }
    }
    
    if (!foundMovement) {
      router.push('/');
      return;
    }
    
    setMovement(foundMovement);
    
    // Set custom rest time or default
    const defaultRestTimes = { weight: 90, bodyweight: 60, duration: 120, distance: 90, reps_only: 60 };
    setCustomRestTime(foundMovement.custom_rest_timer || defaultRestTimes[foundMovement.tracking_type!]);
    
    // Load sets for this movement
    const movementSets = persistenceService.getSetsForUserMovement(movementId);
    setSets(movementSets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  }, [movementId, router]);

  const personalRecords = useMemo(() => {
    if (!movement || sets.length === 0) return null;

    switch (movement.tracking_type) {
      case 'weight':
        const maxWeight = Math.max(...sets.filter(s => s.weight).map(s => s.weight!));
        const maxWeightSet = sets.find(s => s.weight === maxWeight);
        
        // Calculate 1RM
        const best1RM = getBest1RM(sets.filter(s => s.weight && s.reps));
        
        return {
          type: 'Max Weight',
          value: formatWeight(maxWeight),
          details: `${maxWeightSet?.reps || 0} reps`,
          date: maxWeightSet ? new Date(maxWeightSet.created_at).toLocaleDateString() : '',
          oneRM: best1RM ? {
            value: format1RM(best1RM.oneRM),
            fromWeight: best1RM.fromSet.weight!,
            fromReps: best1RM.fromSet.reps!
          } : null
        };
      case 'bodyweight':
        const maxReps = Math.max(...sets.filter(s => s.reps).map(s => s.reps!));
        const maxRepsSet = sets.find(s => s.reps === maxReps);
        return {
          type: 'Max Reps',
          value: `${maxReps} reps`,
          details: '',
          date: maxRepsSet ? new Date(maxRepsSet.created_at).toLocaleDateString() : ''
        };
      case 'duration':
        const maxDuration = Math.max(...sets.filter(s => s.duration).map(s => s.duration!));
        const maxDurationSet = sets.find(s => s.duration === maxDuration);
        return {
          type: 'Best Time',
          value: `${Math.floor(maxDuration / 60)}:${(maxDuration % 60).toString().padStart(2, '0')}`,
          details: '',
          date: maxDurationSet ? new Date(maxDurationSet.created_at).toLocaleDateString() : ''
        };
      default:
        return null;
    }
  }, [movement, sets]);



   const handleUpdateSet = (updatedSet: Set) => {
     const success = persistenceService.saveSet(updatedSet);
     if (success) {
       setSets(prev => prev.map(s => s.id === updatedSet.id ? updatedSet : s));
     }
   };

  const handleDeleteSet = (setId: string) => {
    const setToDelete = sets.find(s => s.id === setId);
    if (setToDelete) {
      setSetToDelete(setToDelete);
      setShowDeleteConfirm(true);
    }
  };

  const handleConfirmDelete = () => {
    if (setToDelete) {
      const success = persistenceService.deleteSet(setToDelete.id);
      if (success) {
        setSets(prev => prev.filter(s => s.id !== setToDelete.id));
      }
    }
    setShowDeleteConfirm(false);
    setSetToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setSetToDelete(null);
  };

     const handleDuplicateSet = (originalSet: Set) => {
     if (!movement) return;

     const duplicatedSet: Set = {
       id: crypto.randomUUID(),
       user_movement_id: originalSet.user_movement_id,
       workout_id: null, // TODO: Get actual workout ID
       user_id: 'user', // TODO: Get actual user ID
       set_type: 'working',
       reps: originalSet.reps,
       weight: originalSet.weight,
       duration: originalSet.duration,
       distance: null,
       notes: null,
       created_at: new Date().toISOString(),
     };

     const success = persistenceService.saveSet(duplicatedSet);
     if (success) {
       setSets(prev => [duplicatedSet, ...prev]);
       // Always ensure timer starts fresh - even if it was previously inactive
       setIsRestTimerActive(false);
       // Use requestAnimationFrame to ensure clean state update
       requestAnimationFrame(() => {
         setTimeout(() => {
           setIsRestTimerActive(true);
         }, 10);
       });
     }
   };

   const handleQuickLog = (setData: Partial<Set>) => {
     if (!movement) return;

     const newSet: Set = {
       id: crypto.randomUUID(),
       user_movement_id: movement.id,
       workout_id: null, // TODO: Get actual workout ID
       user_id: 'user', // TODO: Get actual user ID
       set_type: 'working',
       reps: null,
       weight: null,
       duration: null,
       distance: null,
       notes: null,
       created_at: new Date().toISOString(),
       ...setData,
     };

         const success = persistenceService.saveSet(newSet);
    if (success) {
      setSets(prev => [newSet, ...prev]);
      // Always ensure timer starts fresh - even if it was previously inactive
      setIsRestTimerActive(false);
      // Use requestAnimationFrame to ensure clean state update
      requestAnimationFrame(() => {
        setTimeout(() => {
          setIsRestTimerActive(true);
        }, 10);
      });
    }
   };

  if (!movement) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading movement...</p>
        </div>
      </div>
    );
  }

             return (
       <main className="min-h-screen bg-background p-8">
         <div className="max-w-4xl mx-auto">
           <Link href="/" className="text-primary hover:text-primary/80 mb-4 block">
             ← Back to Dashboard
           </Link>
          
                  {/* Movement Header */}
          <div className="bg-card border border-border rounded-lg shadow-md p-6 mb-6">
                          <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{movement.name}</h1>
                  <p className="text-muted-foreground mt-2">{movement.muscle_groups.join(', ')}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full capitalize">
                  {movement.tracking_type}
                </span>
            </div>
            {personalRecords && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Personal Record</p>
                <p className="text-2xl font-bold text-green-500">{personalRecords.value}</p>
                {personalRecords.details && (
                  <p className="text-sm text-muted-foreground">{personalRecords.details}</p>
                )}
                {personalRecords.oneRM && (
                  <div className="mt-2 p-2 bg-primary/10 border border-primary/20 rounded">
                    <p className="text-xs text-primary/70">Estimated 1RM</p>
                    <p className="text-lg font-bold text-primary">{personalRecords.oneRM.value}</p>
                    <p className="text-xs text-primary/70">
                      From {formatWeight(personalRecords.oneRM.fromWeight)} × {personalRecords.oneRM.fromReps}
                    </p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">{personalRecords.date}</p>
              </div>
            )}
          </div>
        </div>

        {/* Rest Timer */}
        <RestTimer
          isActive={isRestTimerActive}
          duration={customRestTime}
          onComplete={() => setIsRestTimerActive(false)}
          onSkip={() => setIsRestTimerActive(false)}
        />
        
        {isRestTimerActive && <div className="mb-6" />}

        {/* Quick Set Entry */}
        <QuickSetEntry
          movement={movement}
          lastSet={sets[0]}
          onQuickLog={handleQuickLog}
        />

        {/* Set History */}
         <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-md p-6">
           <h2 className="text-xl font-semibold text-slate-50 mb-4">History</h2>
          
            {sets.length === 0 ? (
             <div className="text-center py-8">
               <p className="text-slate-400">No sets logged yet.</p>
               <p className="text-sm text-slate-500 mt-2">Log your first set above to start tracking progress!</p>
             </div>
                     ) : (
             <div className="space-y-3">
               {sets.map((set) => (
                 <EditableSet
                   key={set.id}
                   set={set}
                   movement={movement}
                   onUpdate={handleUpdateSet}
                   onDelete={handleDeleteSet}
                   onDuplicate={handleDuplicateSet}
                 />
               ))}
             </div>
           )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Set"
        description={
          setToDelete 
            ? `Are you sure you want to delete this set${
                setToDelete.weight ? ` (${formatWeight(setToDelete.weight)} × ${setToDelete.reps} reps)` :
                setToDelete.reps ? ` (${setToDelete.reps} reps)` :
                setToDelete.duration ? ` (${Math.floor(setToDelete.duration / 60)}:${(setToDelete.duration % 60).toString().padStart(2, '0')})` :
                ''
              }? This action cannot be undone.`
            : ''
        }
        confirmText="Delete Set"
        cancelText="Cancel"
        variant="destructive"
      />
    </main>
  );
}
