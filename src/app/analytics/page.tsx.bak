'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SyncStatusProvider } from '@/components/data/SyncStatusProvider';
import AnalyticsDashboard from '@/components/features/AnalyticsDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <SyncStatusProvider>
        <main className="min-h-screen bg-background p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button variant="ghost" asChild className="mb-2 -ml-4">
                <Link href="/" className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back to Dashboard</span>
                </Link>
              </Button>
              <h1 className="text-3xl font-bold">Analytics & Progress</h1>
              <p className="text-muted-foreground mt-2">
                Track your fitness progress and personal records
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Your Fitness Analytics</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Analytics Dashboard */}
                <AnalyticsDashboard />
              </CardContent>
            </Card>
          </div>
        </main>
      </SyncStatusProvider>
    </ProtectedRoute>
  );
}
