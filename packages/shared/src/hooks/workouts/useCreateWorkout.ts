import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useAuth } from "../../lib/auth/AuthProvider";
import { createClient } from "../../lib/supabase/client";
import { workoutKeys, type Workout, type WorkoutInsert } from "./types";

/**
 * Create a new workout
 */
export function useCreateWorkout(): UseMutationResult<
  Workout,
  Error,
  Omit<WorkoutInsert, "user_id" | "order_index">
> {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (
      workout: Omit<WorkoutInsert, "user_id" | "order_index">
    ) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Get the current max order_index to place new workout at the end
      const { data: existingWorkouts } = await supabase
        .from("workouts")
        .select("order_index")
        .eq("user_id", user.id)
        .order("order_index", { ascending: false })
        .limit(1);

      const maxOrderIndex = existingWorkouts?.[0]?.order_index ?? -1;

      const { data, error } = await supabase
        .from("workouts")
        .insert({
          ...workout,
          user_id: user.id,
          order_index: maxOrderIndex + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newWorkout): Promise<{ previousWorkouts?: Workout[] }> => {
      if (!user?.id) return { previousWorkouts: undefined };

      await queryClient.cancelQueries({ queryKey: workoutKeys.list(user.id) });

      const previousWorkouts = queryClient.getQueryData<Workout[]>(
        workoutKeys.list(user.id)
      );

      const optimisticWorkout = {
        id: `temp-${Date.now()}`,
        ...newWorkout,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData(
        workoutKeys.list(user.id),
        (old: Workout[] | undefined) => [optimisticWorkout, ...(old || [])]
      );

      return { previousWorkouts };
    },
    onError: (
      err,
      newWorkout,
      context: { previousWorkouts?: Workout[] } | undefined
    ) => {
      if (user?.id) {
        queryClient.setQueryData(
          workoutKeys.list(user.id),
          context?.previousWorkouts
        );
      }
      console.error("Error creating workout:", err);
    },
    onSuccess: (data) => {
      if (user?.id) {
        const previousWorkouts = queryClient.getQueryData<Workout[]>(
          workoutKeys.list(user.id)
        );
        if (previousWorkouts) {
          const updatedWorkouts = previousWorkouts.map((w) =>
            w.id.toString().startsWith("temp-") ? data : w
          );
          queryClient.setQueryData(workoutKeys.list(user.id), updatedWorkouts);
        }
        queryClient.setQueryData(workoutKeys.detail(data.id), data);
      }
    },
  });
}
