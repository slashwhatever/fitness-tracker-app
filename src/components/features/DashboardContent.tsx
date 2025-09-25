"use client";

import ResponsiveButton from "@/components/common/ResponsiveButton";
import { Typography } from "@/components/common/Typography";
import WorkoutManagement from "@/components/features/WorkoutManagement";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart3, Dumbbell, Library, Settings } from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";

export default function DashboardContent() {
  const queryClient = useQueryClient();

  const handleWorkoutCreated = () => {
    // Trigger a refresh of the workout list (handled by React Query automatically)
  };

  // Prefetch analytics/library/settings data on hover for instant navigation
  const prefetchPage = useCallback(
    async (page: "analytics" | "library" | "settings") => {
      try {
        if (page === "library") {
          await queryClient.prefetchQuery({
            queryKey: ["movements", "templates"],
            queryFn: async () => {
              const { createClient } = await import("@/lib/supabase/client");
              const supabase = createClient();
              const { data } = await supabase
                .from("movement_templates")
                .select("*")
                .order("name");
              return data || [];
            },
            staleTime: 15 * 60 * 1000, // 15 minutes
          });
        }
      } catch (error) {
        // Prefetch errors are non-critical
        console.debug("Prefetch failed for", page, error);
      }
    },
    [queryClient]
  );

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Dumbbell className="w-6 h-6" aria-hidden="true" />
          <Typography variant="title1">Log Set</Typography>
        </div>
        <div className="flex flex-row space-x-2">
          <ResponsiveButton
            color="primary"
            icon={BarChart3}
            variant="outline"
            asChild
          >
            <Link 
              href="/analytics"
              onMouseEnter={() => prefetchPage("analytics")}
            >
              <Typography variant="body">Analytics</Typography>
            </Link>
          </ResponsiveButton>
          <ResponsiveButton
            color="primary"
            icon={Library}
            variant="outline"
            asChild
          >
            <Link 
              href="/library"
              onMouseEnter={() => prefetchPage("library")}
            >
              <Typography variant="body">Movement Library</Typography>
            </Link>
          </ResponsiveButton>
          <ResponsiveButton
            color="primary"
            icon={Settings}
            variant="outline"
            asChild
          >
            <Link 
              href="/settings"
              onMouseEnter={() => prefetchPage("settings")}
            >
              <Typography variant="body">Settings</Typography>
            </Link>
          </ResponsiveButton>
        </div>
      </div>

      <WorkoutManagement onWorkoutCreated={handleWorkoutCreated} />
    </>
  );
}
