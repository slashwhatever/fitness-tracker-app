import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import AnalyticsDashboard from '@/components/features/AnalyticsDashboard';

export default function AnalyticsPage() { 
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4">
          <AnalyticsDashboard />
        </div>
      </main>
    </ProtectedRoute>


  );
}
