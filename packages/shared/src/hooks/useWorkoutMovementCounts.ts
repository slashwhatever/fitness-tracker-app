"use client";

import { useAuth } from "../lib/auth/AuthProvider";
import { createClient } from "../lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Hook to get movement counts for multiple workouts efficiently
export function useWorkoutMovementCounts(workoutIds: string[]) {
  const { user } = useAuth();
  const supabase = createClient();

  return useQuery({
    queryKey: ["workout-movement-counts", user?.id, workoutIds.sort()],
    queryFn: async () => {
      if (!user?.id || workoutIds.length === 0) return [];

      // Use the workout_movement_counts table for efficient querying
      const { data, error } = await supabase
        .from("workout_movement_counts")
        .select("workout_id, movement_count")
        .eq("user_id", user.id)
        .in("workout_id", workoutIds);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && workoutIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes - movement counts don't change frequently
    gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
    // Always refetch on mount to ensure fresh data when returning to dashboard
    refetchOnMount: "always",
  });
}

// Hook to get movement count for a single workout
export function useWorkoutMovementCount(workoutId: string) {
  const { user } = useAuth();
  const supabase = createClient();

  return useQuery({
    queryKey: ["workout-movement-count", user?.id, workoutId],
    queryFn: async () => {
      if (!user?.id || !workoutId) return null;

      const { data, error } = await supabase
        .from("workout_movement_counts")
        .select("movement_count")
        .eq("user_id", user.id)
        .eq("workout_id", workoutId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // No rows found
        throw error;
      }
      return data;
    },
    enabled: !!user?.id && !!workoutId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}
