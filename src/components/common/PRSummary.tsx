'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HybridStorageManager } from '@/lib/storage/HybridStorageManager';
import { formatWeight, Set as WorkoutSet, UserMovement, Workout } from '@/models/types';
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
          const calculatePRs = async () => {
        const workouts = await HybridStorageManager.getLocalRecords<Workout>('workouts');
        const sets = await HybridStorageManager.getLocalRecords<WorkoutSet>('sets');
      const allMovements: UserMovement[] = [];
      
      // Collect all movements from all workouts
      for (const workout of workouts) {
        // Get workout_movement relationships
        const workoutMovements = await HybridStorageManager.getLocalRecords<{id: string, workout_id: string, user_movement_id: string}>('workout_movements', {
          workout_id: workout.id
        });
        
        // Get actual UserMovement objects
        for (const wm of workoutMovements) {
          const movement = await HybridStorageManager.getLocalRecord<UserMovement>('user_movements', wm.user_movement_id);
          if (movement) {
            allMovements.push(movement);
          }
        }
      }

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
          allMovements.some(m => m.id === set.user_movement_id && m.name === movement.name)
        );

        if (movementSets.length === 0) return;

        let pr: PersonalRecord | null = null;

        switch (movement.tracking_type) {
          case 'weight':
            const maxWeightSet = movementSets.reduce((max, set) => 
              (set.weight || 0) > (max.weight || 0) ? set : max
            );
            if (maxWeightSet.weight) {
              pr = {
                movementName: movement.name,
                value: `${formatWeight(maxWeightSet.weight)} lbs × ${maxWeightSet.reps || 1}`,
                type: 'weight',
                date: new Date(maxWeightSet.created_at).toLocaleDateString()
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
                date: new Date(maxRepsSet.created_at).toLocaleDateString()
              };
            }
            break;
          case 'duration':
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
                date: new Date(maxTimeSet.created_at).toLocaleDateString()
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
    <Card>
      <CardHeader>
        <CardTitle>Personal Records</CardTitle>
      </CardHeader>
      <CardContent>
      
                      {personalRecords.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No personal records yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Start logging sets to track your PRs!</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4 pb-4">
              {personalRecords.map((pr, index) => (
                <div key={`${pr.movementName}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(pr.type)}
                    <div>
                      <p className="font-medium">{pr.movementName}</p>
                      <p className="text-sm text-muted-foreground">{pr.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{pr.value}</p>
                    <p className="text-xs text-muted-foreground uppercase">PR</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
