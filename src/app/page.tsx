'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import PRSummary from '@/components/common/PRSummary';
import { SyncStatusProvider } from '@/components/data/SyncStatusProvider';
import AnalyticsDashboard from '@/components/features/AnalyticsDashboard';
import WorkoutManagement from '@/components/features/WorkoutManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Library } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleWorkoutCreated = () => {
    // Trigger a refresh of the analytics and workout list
    setRefreshKey(prev => prev + 1);
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
                      <Link href="/library" className="flex items-center space-x-2">
                        <Library className="w-5 h-5" aria-hidden="true" />
                        <span>Movement Library</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Analytics Section */}
                <AnalyticsDashboard refreshKey={refreshKey} />

                {/* Personal Records and Workout Management */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PRSummary />
                  <WorkoutManagement onWorkoutCreated={handleWorkoutCreated} />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </SyncStatusProvider>
    </ProtectedRoute>
  );
}
