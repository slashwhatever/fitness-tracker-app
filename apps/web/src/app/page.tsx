import { ProtectedRoute } from "@components/auth/ProtectedRoute";
import DashboardContent from "@components/features/DashboardContent";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4">
          <DashboardContent />
        </div>
      </div>
    </ProtectedRoute>
  );
}

export const metadata = {
  title: "Dashboard - Logset",
  description: "Track your fitness journey and manage your workouts",
};
