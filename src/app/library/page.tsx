import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ContextualNavigation from "@/components/common/ContextualNavigation";
import { Typography } from "@/components/common/Typography";
import LibraryContent from "@/components/features/LibraryContent";

export default function MovementLibraryPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <ContextualNavigation context={{ type: "library" }} />
        <main className="p-2 sm:p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4 mt-4">
            {/* Header */}
            <Typography variant="title1">Movement library</Typography>
            <Typography variant="caption">
              Browse and discover exercises for your workouts
            </Typography>

            <LibraryContent />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export const metadata = {
  title: "Movement Library - Logset",
  description: "Browse and discover exercises for your workouts",
};
