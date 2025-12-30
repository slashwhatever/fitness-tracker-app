import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useAuth } from "../../lib/auth/AuthProvider";
import { createClient } from "../../lib/supabase/client";
import { workoutKeys, type Workout } from "./types";

/**
 * Archive a workout
 */
export function useArchiveWorkout(): UseMutationResult<
  Workout,
  Error,
  { id: string; archived: boolean }
> {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      const { data, error } = await supabase
        .from("workouts")
        .update({ archived })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, archived }) => {
      if (!user?.id) return;

      await queryClient.cancelQueries({ queryKey: workoutKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: workoutKeys.list(user.id) });

      const previousWorkout = queryClient.getQueryData<Workout>(
        workoutKeys.detail(id)
      );

      if (previousWorkout) {
        queryClient.setQueryData(workoutKeys.detail(id), {
          ...previousWorkout,
          archived,
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
      console.error("Error archiving workout:", err);
    },
    onSuccess: (data) => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: workoutKeys.list(user.id) });
        queryClient.setQueryData(workoutKeys.detail(data.id), data);
      }
    },
  });
}
