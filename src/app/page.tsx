'use client';

import AnalyticsCard from '@/components/common/AnalyticsCard';
import CreateWorkoutModal from '@/components/common/CreateWorkoutModal';
import PRSummary from '@/components/common/PRSummary';
import WorkoutList from '@/components/common/WorkoutList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Workout } from '@/models/types';
import { persistenceService } from '@/services/persistenceService';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export default function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [totalSets, setTotalSets] = useState(0);

  useEffect(() => {
    const loadData = () => {
      const allWorkouts = persistenceService.getWorkouts();
      const allSets = persistenceService.getSets();
      
      setWorkouts(allWorkouts);
      setTotalSets(allSets.length);
    };

    loadData();
  }, [refreshKey]);

  const analytics = useMemo(() => {
    const totalWorkouts = workouts.length;
    const totalMovements = workouts.reduce((sum, workout) => sum + workout.userMovements.length, 0);
    
    // Calculate this week's workouts
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekWorkouts = workouts.filter(w => new Date(w.createdAt) >= oneWeekAgo).length;
    
    return {
      totalWorkouts,
      totalMovements,
      totalSets,
      thisWeekWorkouts
    };
  }, [workouts, totalSets]);

  const handleWorkoutCreated = () => {
    // Trigger a refresh of the workout list
    setRefreshKey(prev => prev + 1);
  };

  // Workout selection is now handled by Link navigation in WorkoutList

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl">
                Fitness Tracking App
              </CardTitle>
              <div className="flex space-x-3">
                <Button variant="outline" asChild>
                  <Link href="/library" className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Movement Library</span>
                  </Link>
                </Button>
                <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Workout</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnalyticsCard
                title="Total Workouts"
                value={analytics.totalWorkouts}
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              />
              <AnalyticsCard
                title="Total Sets"
                value={analytics.totalSets}
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              />
              <AnalyticsCard
                title="Total Movements"
                value={analytics.totalMovements}
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              />
              <AnalyticsCard
                title="This Week"
                value={analytics.thisWeekWorkouts}
                subtitle={`${analytics.thisWeekWorkouts > 0 ? 'workouts' : 'No workouts yet'}`}
                trend={analytics.thisWeekWorkouts > 0 ? 'up' : 'neutral'}
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
            </div>

            {/* Personal Records Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PRSummary />
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" asChild className="w-full justify-start h-auto p-4">
                    <Link href="/library" className="flex items-center space-x-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <div className="text-left">
                        <p className="font-medium">Browse Movement Library</p>
                        <p className="text-sm text-muted-foreground">Explore exercises and create workouts</p>
                      </div>
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full justify-start h-auto p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <div className="text-left">
                        <p className="font-medium">Create New Workout</p>
                        <p className="text-sm text-muted-foreground">Start building your routine</p>
                      </div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Workout List Section */}
            <WorkoutList />
          </CardContent>
        </Card>
      </div>

      <CreateWorkoutModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onWorkoutCreated={handleWorkoutCreated}
      />
    </main>
  );
}
