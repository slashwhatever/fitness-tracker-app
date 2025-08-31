'use client';

import AnalyticsCard from '@/components/common/AnalyticsCard';
import { Workout } from '@/models/types';
import { HybridStorageManager } from '@/lib/storage/HybridStorageManager';
import { BarChart3, Calendar, Dumbbell, Target } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface AnalyticsDashboardProps {
  refreshKey?: number;
}

export default function AnalyticsDashboard({ refreshKey = 0 }: AnalyticsDashboardProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [totalSets, setTotalSets] = useState(0);
  const [totalMovements, setTotalMovements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      setIsLoading(true);
      try {
        const allWorkouts = await HybridStorageManager.getLocalRecords<Workout>('workouts');
        const allSets = await HybridStorageManager.getLocalRecords('sets');
        
        // Calculate total movements across all workouts
        let movementCount = 0;
        for (const workout of allWorkouts) {
          const workoutMovements = await HybridStorageManager.getLocalRecords('workout_movements', {
            workout_id: workout.id
          });
          movementCount += workoutMovements.length;
        }
        
        setWorkouts(allWorkouts);
        setTotalSets(allSets.length);
        setTotalMovements(movementCount);
      } catch (error) {
        console.error('Failed to load analytics data test:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, [refreshKey]);

  const analytics = useMemo(() => {
    if (isLoading) {
      return {
        totalWorkouts: 0,
        totalMovements: 0,
        totalSets: 0,
        thisWeekWorkouts: 0
      };
    }

    const totalWorkouts = workouts.length;
    
    // Calculate this week's workouts
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekWorkouts = workouts.filter(w => 
      new Date(w.created_at) >= oneWeekAgo
    ).length;
    
    return {
      totalWorkouts,
      totalMovements: totalMovements,
      totalSets,
      thisWeekWorkouts
    };
  }, [workouts, totalSets, totalMovements, isLoading]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted rounded-lg h-32"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <AnalyticsCard
        title="Total Workouts"
        value={analytics.totalWorkouts}
        icon={<BarChart3 className="w-8 h-8" aria-hidden="true" />}
      />
      
      <AnalyticsCard
        title="Total Sets"
        value={analytics.totalSets}
        icon={<Target className="w-8 h-8" aria-hidden="true" />}
      />
      
      <AnalyticsCard
        title="Total Movements"
        value={analytics.totalMovements}
        icon={<Dumbbell className="w-8 h-8" aria-hidden="true" />}
      />
      
      <AnalyticsCard
        title="This Week"
        value={analytics.thisWeekWorkouts}
        subtitle={`${analytics.thisWeekWorkouts > 0 ? 'workouts' : 'No workouts yet'}`}
        trend={analytics.thisWeekWorkouts > 0 ? 'up' : 'neutral'}
        icon={<Calendar className="w-8 h-8" aria-hidden="true" />}
      />
    </div>
  );
}
