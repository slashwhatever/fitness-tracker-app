'use client';

import { UserMovement } from '@/models/types';
import { persistenceService } from '@/services/persistenceService';
import { useEffect, useState } from 'react';

interface PersonalRecord {
  movementName: string;
  value: string;
  type: 'weight' | 'reps' | 'time';
  date: string;
}

export default function PRSummary() {
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);

  useEffect(() => {
    const calculatePRs = () => {
      const workouts = persistenceService.getWorkouts();
      const sets = persistenceService.getSets();
      const allMovements: UserMovement[] = [];
      
      // Collect all movements from all workouts
      workouts.forEach(workout => {
        allMovements.push(...workout.userMovements);
      });

      const prs: PersonalRecord[] = [];

      // Calculate PRs for each unique movement
      const movementMap = new Map<string, UserMovement>();
      allMovements.forEach(movement => {
        if (!movementMap.has(movement.name)) {
          movementMap.set(movement.name, movement);
        }
      });

      movementMap.forEach((movement) => {
        const movementSets = sets.filter(set => 
          allMovements.some(m => m.id === set.userMovementId && m.name === movement.name)
        );

        if (movementSets.length === 0) return;

        let pr: PersonalRecord | null = null;

        switch (movement.trackingType) {
          case 'weight':
            const maxWeightSet = movementSets.reduce((max, set) => 
              (set.weight || 0) > (max.weight || 0) ? set : max
            );
            if (maxWeightSet.weight) {
              pr = {
                movementName: movement.name,
                value: `${maxWeightSet.weight} lbs × ${maxWeightSet.reps || 1}`,
                type: 'weight',
                date: new Date(maxWeightSet.createdAt).toLocaleDateString()
              };
            }
            break;
          case 'bodyweight':
            const maxRepsSet = movementSets.reduce((max, set) => 
              (set.reps || 0) > (max.reps || 0) ? set : max
            );
            if (maxRepsSet.reps) {
              pr = {
                movementName: movement.name,
                value: `${maxRepsSet.reps} reps`,
                type: 'reps',
                date: new Date(maxRepsSet.createdAt).toLocaleDateString()
              };
            }
            break;
          case 'timed':
            const maxTimeSet = movementSets.reduce((max, set) => 
              (set.duration || 0) > (max.duration || 0) ? set : max
            );
            if (maxTimeSet.duration) {
              const mins = Math.floor(maxTimeSet.duration / 60);
              const secs = maxTimeSet.duration % 60;
              pr = {
                movementName: movement.name,
                value: `${mins}:${secs.toString().padStart(2, '0')}`,
                type: 'time',
                date: new Date(maxTimeSet.createdAt).toLocaleDateString()
              };
            }
            break;
        }

        if (pr) {
          prs.push(pr);
        }
      });

      // Sort by date (most recent first) and take top 5
      prs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPersonalRecords(prs.slice(0, 5));
    };

    calculatePRs();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weight':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'reps':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'time':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-slate-50 mb-4">Personal Records</h3>
      
              {personalRecords.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No personal records yet.</p>
            <p className="text-sm text-slate-500 mt-2">Start logging sets to track your PRs!</p>
          </div>
      ) : (
        <div className="space-y-4">
          {personalRecords.map((pr, index) => (
                         <div key={`${pr.movementName}-${index}`} className="flex items-center justify-between p-3 border border-slate-600 rounded-lg bg-slate-700">
               <div className="flex items-center space-x-3">
                 {getTypeIcon(pr.type)}
                 <div>
                   <p className="font-medium text-slate-50">{pr.movementName}</p>
                   <p className="text-sm text-slate-300">{pr.date}</p>
                 </div>
               </div>
               <div className="text-right">
                 <p className="font-bold text-lg text-slate-50">{pr.value}</p>
                 <p className="text-xs text-slate-400 uppercase">PR</p>
               </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
