'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import WorkoutManagement from '@/components/features/WorkoutManagement';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/AuthProvider';
import { BarChart3, Library, Settings } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { loading } = useAuth();

  const handleWorkoutCreated = () => {
    // Trigger a refresh of the workout list (handled by React Query automatically)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we set up your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
              Log Set
            </h1>
            <div className="flex flex-row space-x-2">
              <Button variant="outline" asChild size="sm" className="h-8 w-8 sm:w-auto p-0 sm:px-3">
                <Link href="/analytics" className="flex items-center sm:space-x-2">
                  <BarChart3 className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline text-xs sm:text-sm">Analytics</span>
                </Link>
              </Button>
              <Button variant="outline" asChild size="sm" className="h-8 w-8 sm:w-auto p-0 sm:px-3">
                <Link href="/library" className="flex items-center sm:space-x-2">
                  <Library className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline text-xs sm:text-sm">Movement Library</span>
                </Link>
              </Button>
              <Button variant="outline" asChild size="sm" className="h-8 w-8 sm:w-auto p-0 sm:px-3">
                <Link href="/settings" className="flex items-center sm:space-x-2">
                  <Settings className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline text-xs sm:text-sm">Settings</span>
                </Link>
              </Button>
            </div>
          </div>
          
          <WorkoutManagement onWorkoutCreated={handleWorkoutCreated} />
        </div>
      </main>
    </ProtectedRoute>
  );
}