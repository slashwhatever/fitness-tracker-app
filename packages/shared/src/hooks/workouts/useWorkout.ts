import { createClient } from "@/lib/supabase/client";
import { isSafeForQueries } from "@/lib/utils/validation";
import type { QueryData } from "@supabase/supabase-js";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { workoutKeys, type Workout } from "./types";

/**
 * Get a single workout
 */
export function useWorkout(
  workoutId: string
): UseQueryResult<Workout | null, Error> {
  const supabase = createClient();

  return useQuery({
    queryKey: workoutKeys.detail(workoutId),
    queryFn: async () => {
      const query = supabase
        .from("workouts")
        .select("*")
        .eq("id", workoutId)
        .single();

      type QueryResult = QueryData<typeof query>;

      const { data, error } = await query;
      if (error) throw error;
      return data as QueryResult;
    },
    enabled: isSafeForQueries(workoutId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}
