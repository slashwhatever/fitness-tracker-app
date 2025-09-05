'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import ResponsiveButton from '@/components/common/ResponsiveButton';
import { Typography } from '@/components/common/Typography';
import WorkoutManagement from '@/components/features/WorkoutManagement';
import Loading from '@/components/Loading';
import { useAuth } from '@/lib/auth/AuthProvider';
import { BarChart3, Dumbbell, Library, Settings } from 'lucide-react';

export default function Dashboard() {
  const { loading } = useAuth();

  const handleWorkoutCreated = () => {
    // Trigger a refresh of the workout list (handled by React Query automatically)
  };

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Dumbbell className="w-6 h-6" aria-hidden="true" />
              <Typography variant="title1">
                Log Set
              </Typography>
            </div>
            <div className="flex flex-row space-x-2">
              <ResponsiveButton color="primary" icon={BarChart3} variant="outline" url="/analytics">
                Analytics
              </ResponsiveButton>
              <ResponsiveButton color="primary" icon={Library} variant="outline" url="/library">
                Movement Library
              </ResponsiveButton>
              <ResponsiveButton color="primary" icon={Settings} variant="outline" url="/settings">
                Settings
              </ResponsiveButton>
            </div>
          </div>
          
          <WorkoutManagement onWorkoutCreated={handleWorkoutCreated} />
        </div>
      </main>
    </ProtectedRoute>
  );
}