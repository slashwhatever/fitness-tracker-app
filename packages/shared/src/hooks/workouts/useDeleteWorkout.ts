import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useAuth } from "../../lib/auth/AuthProvider";
import { createClient } from "../../lib/supabase/client";
import { workoutKeys, type Workout } from "./types";

/**
 * Delete a workout
 */
export function useDeleteWorkout(): UseMutationResult<void, Error, string> {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("workouts").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      if (!user?.id) return;

      await queryClient.cancelQueries({ queryKey: workoutKeys.list(user.id) });

      const previousWorkouts = queryClient.getQueryData<Workout[]>(
        workoutKeys.list(user.id)
      );

      if (previousWorkouts) {
        queryClient.setQueryData(
          workoutKeys.list(user.id),
          previousWorkouts.filter((w) => w.id !== id)
        );
      }

      return { previousWorkouts };
    },
    onError: (err, id, context) => {
      if (user?.id && context?.previousWorkouts) {
        queryClient.setQueryData(
          workoutKeys.list(user.id),
          context.previousWorkouts
        );
      }
      console.error("Error deleting workout:", err);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: workoutKeys.list(user.id) });
      }
    },
  });
}
