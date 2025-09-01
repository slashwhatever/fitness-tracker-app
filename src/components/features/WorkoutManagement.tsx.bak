'use client';

import CreateWorkoutModal from '@/components/common/CreateWorkoutModal';
import WorkoutList, { WorkoutListRef } from '@/components/common/WorkoutList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Workout } from '@/models/types';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

interface WorkoutManagementProps {
  onWorkoutCreated?: (workout: Workout) => void;
}

export default function WorkoutManagement({ onWorkoutCreated }: WorkoutManagementProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const workoutListRef = useRef<WorkoutListRef>(null);

  const handleWorkoutCreated = async (workout: Workout) => {
    setIsCreateModalOpen(false);
    onWorkoutCreated?.(workout);
    // Refresh the workout list to show the new workout
    await workoutListRef.current?.refreshWorkouts();
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full justify-start h-auto p-4"
          >
            <div className="flex items-center space-x-3">
              <Plus className="w-6 h-6" aria-hidden="true" />
              <div className="text-left">
                <p className="font-medium">Create New Workout</p>
                <p className="text-sm text-primary-foreground/80">Start building your routine</p>
              </div>
            </div>
          </Button>
          
          <Button variant="outline" asChild className="w-full justify-start h-auto p-4">
            <Link href="/library" className="flex items-center space-x-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <div className="text-left">
                <p className="font-medium">Browse Movement Library</p>
                <p className="text-sm text-muted-foreground">Explore exercises and create workouts</p>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Workout List */}
      <WorkoutList ref={workoutListRef} />

      {/* Create Workout Modal */}
      <CreateWorkoutModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onWorkoutCreated={handleWorkoutCreated}
      />
    </div>
  );
}
