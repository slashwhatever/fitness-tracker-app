'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import WorkoutManagement from '@/components/features/WorkoutManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-3xl">
                  Log Set
                </CardTitle>
                <div className="flex space-x-3">
                  <Button variant="outline" asChild>
                    <Link href="/analytics" className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5" aria-hidden="true" />
                      <span>Analytics</span>
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/library" className="flex items-center space-x-2">
                      <Library className="w-5 h-5" aria-hidden="true" />
                      <span>Movement Library</span>
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/settings" className="flex items-center space-x-2">
                      <Settings className="w-5 h-5" aria-hidden="true" />
                      <span>Settings</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <WorkoutManagement onWorkoutCreated={handleWorkoutCreated} />
            </CardContent>
          </Card>
        </div>
      </main>
    </ProtectedRoute>
  );
}