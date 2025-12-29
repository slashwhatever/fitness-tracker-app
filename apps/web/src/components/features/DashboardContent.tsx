"use client";

import ResponsiveButton from "@/components/common/ResponsiveButton";
import { Typography } from "@/components/common/Typography";
import { DashboardSkeleton } from "@/components/ui/skeleton-patterns";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart3, Dumbbell, Library, Settings } from "lucide-react";
import Link from "next/link";
import { Suspense, lazy, useCallback } from "react";

// Lazy load the heavy WorkoutManagement component
const WorkoutManagement = lazy(
  () => import("@/components/features/WorkoutManagement")
);

export default function DashboardContent() {
  const queryClient = useQueryClient();

  // Comprehensive prefetching strategy for instant navigation
  const prefetchPage = useCallback(
    async (page: "analytics" | "library" | "settings") => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        if (page === "library") {
          // Prefetch movement templates with optimized query
          await queryClient.prefetchQuery({
            queryKey: ["movements", "templates"],
            queryFn: async () => {
              const { data } = await supabase
                .from("movement_templates")
                .select(
                  `
                  id,
                  name,
                  description,
                  experience_level,
                  tracking_type_id,
                  created_at,
                  updated_at,
                  tracking_types!inner(name),
                  movement_template_muscle_groups!inner(
                    muscle_groups!inner(name, display_name)
                  )
                `
                )
                .order("name");
              return data || [];
            },
            staleTime: 15 * 60 * 1000, // 15 minutes
          });

          // Prefetch muscle groups for filters
          await queryClient.prefetchQuery({
            queryKey: ["muscle_groups"],
            queryFn: async () => {
              const { data } = await supabase
                .from("muscle_groups")
                .select("*")
                .order("display_name");
              return data || [];
            },
            staleTime: 30 * 60 * 1000, // 30 minutes - rarely changes
          });

          // Prefetch tracking types
          await queryClient.prefetchQuery({
            queryKey: ["tracking_types"],
            queryFn: async () => {
              const { data } = await supabase
                .from("tracking_types")
                .select("*")
                .order("display_name");
              return data || [];
            },
            staleTime: 30 * 60 * 1000, // 30 minutes - rarely changes
          });
        } else if (page === "settings") {
          // Prefetch user profile for settings page
          await queryClient.prefetchQuery({
            queryKey: ["user_profile"],
            queryFn: async () => {
              const {
                data: { user },
              } = await supabase.auth.getUser();
              if (!user) return null;

              const { data } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("user_id", user.id)
                .single();
              return data;
            },
            staleTime: 5 * 60 * 1000, // 5 minutes
          });
        } else if (page === "analytics") {
          // Prefetch analytics data
          await queryClient.prefetchQuery({
            queryKey: ["analytics", "overview"],
            queryFn: async () => {
              const {
                data: { user },
              } = await supabase.auth.getUser();
              if (!user) return null;

              // Prefetch recent workout count and other basic analytics
              const { data } = await supabase
                .from("workouts")
                .select("id, created_at")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(10);
              return data || [];
            },
            staleTime: 2 * 60 * 1000, // 2 minutes
          });
        }
      } catch (error) {
        // Prefetch errors are non-critical - fail silently
        if (process.env.NODE_ENV === "development") {
          console.debug("Prefetch failed for", page, error);
        }
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
            <Link href="/library" onMouseEnter={() => prefetchPage("library")}>
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

      <Suspense fallback={<DashboardSkeleton />}>
        <WorkoutManagement />
      </Suspense>
    </>
  );
}
