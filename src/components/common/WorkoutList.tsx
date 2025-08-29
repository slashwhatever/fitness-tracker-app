'use client';

import { Workout } from '@/models/types';
import { persistenceService } from '@/services/persistenceService';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    // Load workouts from localStorage
    const savedWorkouts = persistenceService.getWorkouts();
    setWorkouts(savedWorkouts);
  }, []);

  // Workout navigation is now handled by Link components

  if (workouts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">No workouts created yet.</p>
        <p className="text-sm text-slate-500 mt-2">Create your first workout to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-50">Your Workouts</h3>
      <div className="grid gap-3">
        {workouts.map((workout) => (
          <Link
            key={workout.id}
            href={`/workout/${workout.id}`}
            className="block bg-slate-800 border border-slate-600 rounded-lg p-4 hover:bg-slate-700 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium text-slate-50">{workout.name}</h4>
                {workout.description && (
                  <p className="text-sm text-slate-300 mt-1">{workout.description}</p>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  {workout.userMovements.length} movements • Created {new Date(workout.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
