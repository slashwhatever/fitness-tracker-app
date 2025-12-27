import { ProtectedRoute } from "@components/auth/ProtectedRoute";
import ContextualNavigation from "@components/common/ContextualNavigation";
import AnalyticsDashboard from "@components/features/AnalyticsDashboard";

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <ContextualNavigation context={{ type: "analytics" }} />
        <main className="p-2 sm:p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4 mt-2">
            <AnalyticsDashboard />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
