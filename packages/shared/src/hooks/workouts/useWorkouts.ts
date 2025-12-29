import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { QueryData } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { workoutKeys, type WorkoutWithGroup } from "./types";

/**
 * Get all workouts for a user
 */
export function useWorkouts(): {
  workouts: WorkoutWithGroup[] | undefined;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
} {
  const { user } = useAuth();
  const supabase = createClient();

  const query = useQuery({
    queryKey: workoutKeys.list(user?.id || ""),
    queryFn: async () => {
      if (!user?.id) return [];

      const dbQuery = supabase
        .from("workouts")
        .select("*, workout_groups(name)")
        .eq("user_id", user.id)
        .order("order_index", { ascending: true });

      type QueryResult = QueryData<typeof dbQuery>;

      const { data, error } = await dbQuery;
      if (error) throw error;
      return data as QueryResult;
    },
    enabled: !!user?.id,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnMount: "always",
  });

  return {
    workouts: query.data,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
}
