"use client";

import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

/**
 * Hook for background synchronization of critical data
 * Runs when the app becomes visible or network reconnects
 */
export function useBackgroundSync() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const syncCriticalData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const supabase = createClient();

      // Background sync for user profile (critical for app functionality)
      await queryClient.prefetchQuery({
        queryKey: ["user_profiles", user.id],
        queryFn: async () => {
          const { data } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      });

      // Background sync for recent workouts (for dashboard)
      await queryClient.prefetchQuery({
        queryKey: ["workouts", "list", user.id],
        queryFn: async () => {
          const { data } = await supabase
            .from("workouts")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5);
          return data || [];
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
      });

      // Background sync for movement counts (for dashboard)
      const { data: workouts } = await supabase
        .from("workouts")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (workouts?.length) {
        const workoutIds = workouts.map((w) => w.id);
        await queryClient.prefetchQuery({
          queryKey: ["workout-movement-counts", workoutIds],
          queryFn: async () => {
            const { data } = await supabase
              .from("workout_movement_counts")
              .select("*")
              .in("workout_id", workoutIds);
            return data || [];
          },
          staleTime: 3 * 60 * 1000, // 3 minutes
        });
      }
    } catch (error) {
      // Background sync errors are non-critical
      if (process.env.NODE_ENV === "development") {
        console.debug("Background sync failed:", error);
      }
    }
  }, [queryClient, user?.id]);

  useEffect(() => {
    // Sync when app becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncCriticalData();
      }
    };

    // Sync when network reconnects
    const handleOnline = () => {
      syncCriticalData();
    };

    // Initial sync after a short delay
    const timeoutId = setTimeout(syncCriticalData, 2000);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
    };
  }, [syncCriticalData]);
}
