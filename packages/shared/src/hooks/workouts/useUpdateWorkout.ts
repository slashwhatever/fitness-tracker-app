import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useAuth } from "../../lib/auth/AuthProvider";
import { createClient } from "../../lib/supabase/client";
import { workoutKeys, type Workout, type WorkoutUpdate } from "./types";

/**
 * Update a workout
 */
export function useUpdateWorkout(): UseMutationResult<
  Workout,
  Error,
  WorkoutUpdate & { id: string }
> {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: WorkoutUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("workouts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, ...updates }) => {
      if (!user?.id) return;

      await queryClient.cancelQueries({ queryKey: workoutKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: workoutKeys.list(user.id) });

      const previousWorkout = queryClient.getQueryData<Workout>(
        workoutKeys.detail(id)
      );

      if (previousWorkout) {
        queryClient.setQueryData(workoutKeys.detail(id), {
          ...previousWorkout,
          ...updates,
          updated_at: new Date().toISOString(),
        });
      }

      return { previousWorkout };
    },
    onError: (err, variables, context) => {
      if (context?.previousWorkout) {
        queryClient.setQueryData(
          workoutKeys.detail(variables.id),
          context.previousWorkout
        );
      }
      console.error("Error updating workout:", err);
    },
    onSuccess: (data) => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: workoutKeys.list(user.id) });
        queryClient.setQueryData(workoutKeys.detail(data.id), data);
      }
    },
  });
}
