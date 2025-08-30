'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Workouts</CardTitle>
      </CardHeader>
      <CardContent>
        {workouts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No workouts created yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Create your first workout to get started!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {workouts.map((workout) => (
              <Button 
                key={workout.id} 
                variant="outline" 
                asChild 
                className="h-auto p-4 justify-start"
              >
                <Link href={`/workout/${workout.id}`}>
                  <div className="flex justify-between items-start w-full">
                    <div className="flex-1 text-left">
                      <h4 className="font-medium">{workout.name}</h4>
                      {workout.description && (
                        <p className="text-sm text-muted-foreground mt-1">{workout.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {persistenceService.getMovementCountForWorkout(workout.id)} movements • Created {new Date(workout.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-muted-foreground ml-4">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
