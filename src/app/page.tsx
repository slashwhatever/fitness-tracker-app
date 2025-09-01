'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useSyncContext } from '@/components/data/SyncStatusProvider';
import WorkoutManagement from '@/components/features/WorkoutManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/AuthProvider';
import { SupabaseService } from '@/services/supabaseService';
import { BarChart3, Library, Settings } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { syncStatus, triggerManualSync, refreshStatus } = useSyncContext();
  const [syncResult, setSyncResult] = useState<string>('');

  const handleWorkoutCreated = () => {
    // Trigger a refresh of the workout list (placeholder for future use)
  };

  const handleManualSync = async () => {
    console.log('🔄 Manual sync button clicked');
    console.log('User authenticated:', !!user);
    console.log('Supabase connected:', syncStatus.supabaseConnected);
    
    try {
      const result = await triggerManualSync();
      setSyncResult(`Sync ${result.success ? 'successful' : 'failed'}: ${result.message}`);
      console.log('Manual sync result:', result);
    } catch (error) {
      console.error('Manual sync error:', error);
      setSyncResult(`Sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleTestConnection = async () => {
    try {
      if (!user?.id) {
        setSyncResult('No user authenticated');
        return;
      }

      // Test basic operations
      const workouts = await SupabaseService.getWorkouts(user.id);
      const userMovements = await SupabaseService.getUserMovements(user.id);
      
      setSyncResult(`✅ Connection test passed! Found ${workouts.length} workouts, ${userMovements.length} movements`);
    } catch (error) {
      console.error('Connection test error:', error);
      setSyncResult(`❌ Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleClearLocal = () => {
    if (!confirm('⚠️ This will clear all local browser data. Are you sure?')) {
      return;
    }
    
    try {
      localStorage.clear();
      sessionStorage.clear();
      setSyncResult('🗑️ Local storage cleared');
      console.log('🗑️ Local storage cleared');
    } catch (error) {
      console.error('Clear local error:', error);
      setSyncResult(`Clear error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
                  <Button variant="outline" asChild>
                    <Link href="/settings" className="flex items-center space-x-2">
                      <Settings className="w-5 h-5" aria-hidden="true" />
                      <span>Settings</span>
                    </Link>
                  </Button>
                </div>
              </div>
              {syncResult && (
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                  {syncResult}
                </div>
              )}
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
