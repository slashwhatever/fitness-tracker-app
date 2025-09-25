import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ContextualNavigation from "@/components/common/ContextualNavigation";
import { Typography } from "@/components/common/Typography";
import SettingsContent from "@/components/features/SettingsContent";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <ContextualNavigation context={{ type: "settings" }} />
        <main className="p-2 sm:p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4 mt-2">
            <div className="mb-6">
              <Typography variant="title2">Settings</Typography>
              <Typography variant="caption">
                Manage your profile preferences and workout settings
              </Typography>
            </div>

            <SettingsContent />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export const metadata = {
  title: "Settings - Logset",
  description: "Manage your profile preferences and workout settings",
};
