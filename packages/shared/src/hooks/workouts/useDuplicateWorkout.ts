import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useAuth } from "../../lib/auth/AuthProvider";
import { createClient } from "../../lib/supabase/client";
import { workoutKeys, type Workout } from "./types";

/**
 * Duplicate a workout
 */
export function useDuplicateWorkout(): UseMutationResult<
  Workout,
  Error,
  string
> {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (originalWorkoutId: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      // 1. Fetch the original workout
      const { data: original, error: fetchError } = await supabase
        .from("workouts")
        .select("*")
        .eq("id", originalWorkoutId)
        .single();

      if (fetchError) throw fetchError;
      if (!original) throw new Error("Workout not found");

      // 2. Get max order index
      const { data: existingWorkouts } = await supabase
        .from("workouts")
        .select("order_index")
        .eq("user_id", user.id)
        .order("order_index", { ascending: false })
        .limit(1);

      const maxOrderIndex = existingWorkouts?.[0]?.order_index ?? -1;

      // 3. Create the copy
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, created_at, updated_at, ...workoutData } = original;
      const { data: newWorkout, error: createError } = await supabase
        .from("workouts")
        .insert({
          ...workoutData,
          name: `${workoutData.name} (Copy)`,
          order_index: maxOrderIndex + 1,
          user_id: user.id, // ensure ownership
        })
        .select()
        .single();

      if (createError) throw createError;
      return newWorkout;
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: workoutKeys.list(user.id) });
      }
    },
  });
}
