'use client';

import AnalyticsCard from '@/components/common/AnalyticsCard';
import { useAuth } from '@/lib/auth/AuthProvider';
import { PersonalRecord, Set, UserMovement, Workout } from '@/models/types';
import { SupabaseService } from '@/services/supabaseService';
import { BarChart3, Calendar, Dumbbell, Target } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [sets, setSets] = useState<Set[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [userMovements, setUserMovements] = useState<UserMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const [workoutsData, setsData, prsData, movementsData] = await Promise.all([
          SupabaseService.getWorkouts(user.id),
          SupabaseService.getSets(user.id),
          SupabaseService.getPersonalRecords(user.id),
          SupabaseService.getUserMovements(user.id),
        ]);

        setWorkouts(workoutsData);
        setSets(setsData);
        setPersonalRecords(prsData);
        setUserMovements(movementsData);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [user?.id]);

  const analytics = useMemo(() => {
    if (loading) {
      return {
        totalWorkouts: 0,
        totalMovements: 0,
        totalSets: 0,
        thisWeekWorkouts: 0
      };
    }

    const totalWorkouts = workouts.length;
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);
    const thisWeekWorkouts = workouts.filter(workout => 
      new Date(workout.created_at) >= thisWeekStart
    ).length;

    return {
      totalWorkouts,
      totalMovements: userMovements.length,
      totalSets: sets.length,
      thisWeekWorkouts
    };
  }, [workouts, userMovements, sets, loading]);

  if (loading) {
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
