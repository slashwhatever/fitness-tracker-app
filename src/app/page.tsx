'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SyncStatusProvider } from '@/components/data/SyncStatusProvider';
import WorkoutManagement from '@/components/features/WorkoutManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Library } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const handleWorkoutCreated = () => {
    // Trigger a refresh of the workout list (placeholder for future use)
  };

  return (
    <ProtectedRoute>
      <SyncStatusProvider>
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
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Workout Management */}
                <WorkoutManagement onWorkoutCreated={handleWorkoutCreated} />
              </CardContent>
            </Card>
          </div>
        </main>
      </SyncStatusProvider>
    </ProtectedRoute>
  );
}
