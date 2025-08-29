'use client';

import EditableSet from '@/components/common/EditableSet';
import QuickSetEntry from '@/components/common/QuickSetEntry';
import RestTimer from '@/components/common/RestTimer';
import { Set, UserMovement } from '@/models/types';
import { persistenceService } from '@/services/persistenceService';
import { format1RM, getBest1RM } from '@/utils/oneRepMax';
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

  useEffect(() => {
    // Find the movement across all workouts
    const allWorkouts = persistenceService.getWorkouts();
    let foundMovement: UserMovement | null = null;
    
    for (const workout of allWorkouts) {
      const foundInWorkout = workout.userMovements.find(m => m.id === movementId);
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
    const defaultRestTimes = { weight: 90, bodyweight: 60, timed: 120 };
    setCustomRestTime(foundMovement.customRestTimer || defaultRestTimes[foundMovement.trackingType!]);
    
    // Load sets for this movement
    const movementSets = persistenceService.getSetsForUserMovement(movementId);
    setSets(movementSets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, [movementId, router]);

  const personalRecords = useMemo(() => {
    if (!movement || sets.length === 0) return null;

    switch (movement.trackingType) {
      case 'weight':
        const maxWeight = Math.max(...sets.filter(s => s.weight).map(s => s.weight!));
        const maxWeightSet = sets.find(s => s.weight === maxWeight);
        
        // Calculate 1RM
        const best1RM = getBest1RM(sets.filter(s => s.weight && s.reps));
        
        return {
          type: 'Max Weight',
          value: `${maxWeight} lbs`,
          details: `${maxWeightSet?.reps || 0} reps`,
          date: maxWeightSet ? new Date(maxWeightSet.createdAt).toLocaleDateString() : '',
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
          date: maxRepsSet ? new Date(maxRepsSet.createdAt).toLocaleDateString() : ''
        };
      case 'timed':
        const maxDuration = Math.max(...sets.filter(s => s.duration).map(s => s.duration!));
        const maxDurationSet = sets.find(s => s.duration === maxDuration);
        return {
          type: 'Best Time',
          value: `${Math.floor(maxDuration / 60)}:${(maxDuration % 60).toString().padStart(2, '0')}`,
          details: '',
          date: maxDurationSet ? new Date(maxDurationSet.createdAt).toLocaleDateString() : ''
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
    const success = persistenceService.deleteSet(setId);
    if (success) {
      setSets(prev => prev.filter(s => s.id !== setId));
    }
  };

     const handleDuplicateSet = (originalSet: Set) => {
     if (!movement) return;

     const duplicatedSet: Set = {
       id: crypto.randomUUID(),
       userMovementId: originalSet.userMovementId,
       createdAt: new Date(),
       reps: originalSet.reps,
       weight: originalSet.weight,
       duration: originalSet.duration,
     };

     const success = persistenceService.saveSet(duplicatedSet);
     if (success) {
       setSets(prev => [duplicatedSet, ...prev]);
       // Force timer restart with a clean state cycle
       setIsRestTimerActive(false);
       // Use a longer timeout to ensure clean state transition
       setTimeout(() => {
         setIsRestTimerActive(true);
       }, 100);
     }
   };

   const handleQuickLog = (setData: Partial<Set>) => {
     if (!movement) return;

     const newSet: Set = {
       id: crypto.randomUUID(),
       userMovementId: movement.id,
       createdAt: new Date(),
       ...setData,
     };

         const success = persistenceService.saveSet(newSet);
    if (success) {
      setSets(prev => [newSet, ...prev]);
      // Ensure timer is reset and restarted
      setIsRestTimerActive(false);
      setTimeout(() => setIsRestTimerActive(true), 50);
    }
   };

  if (!movement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading movement...</p>
        </div>
      </div>
    );
  }

             return (
       <main className="min-h-screen bg-slate-900 p-8">
         <div className="max-w-4xl mx-auto">
           <Link href="/" className="text-blue-400 hover:text-blue-300 mb-4 block">
             ← Back to Dashboard
           </Link>
          
                  {/* Movement Header */}
          <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-slate-50">{movement.name}</h1>
                <p className="text-slate-300 mt-2">{movement.muscleGroup}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full capitalize">
                {movement.trackingType}
              </span>
            </div>
            {personalRecords && (
              <div className="text-right">
                <p className="text-sm text-slate-400">Personal Record</p>
                <p className="text-2xl font-bold text-green-400">{personalRecords.value}</p>
                {personalRecords.details && (
                  <p className="text-sm text-slate-300">{personalRecords.details}</p>
                )}
                {personalRecords.oneRM && (
                  <div className="mt-2 p-2 bg-blue-900 border border-blue-700 rounded">
                    <p className="text-xs text-blue-300">Estimated 1RM</p>
                    <p className="text-lg font-bold text-blue-100">{personalRecords.oneRM.value}</p>
                    <p className="text-xs text-blue-300">
                      From {personalRecords.oneRM.fromWeight} lbs × {personalRecords.oneRM.fromReps}
                    </p>
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-2">{personalRecords.date}</p>
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
    </main>
  );
}
