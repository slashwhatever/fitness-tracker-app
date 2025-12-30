import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useAuth } from "../../lib/auth/AuthProvider";
import { createClient } from "../../lib/supabase/client";
import { workoutKeys, type Workout } from "./types";

/**
 * Reorder workouts
 */
export function useReorderWorkouts(): UseMutationResult<
  void,
  Error,
  { id: string; order_index: number }[]
> {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (items: { id: string; order_index: number }[]) => {
      if (!items.length) return;

      // Update each workout's order_index individually
      const updatePromises = items.map((item) =>
        supabase
          .from("workouts")
          .update({ order_index: item.order_index })
          .eq("id", item.id)
      );

      const results = await Promise.all(updatePromises);
      const errors = results.filter((r) => r.error).map((r) => r.error);

      if (errors.length > 0) {
        throw new Error(`Failed to reorder workouts: ${errors[0]?.message}`);
      }
    },
    onMutate: async (items) => {
      if (!user?.id) return;

      await queryClient.cancelQueries({ queryKey: workoutKeys.list(user.id) });

      const previousWorkouts = queryClient.getQueryData<Workout[]>(
        workoutKeys.list(user.id)
      );

      if (previousWorkouts) {
        const orderMap = new Map(items.map((i) => [i.id, i.order_index]));
        const optimizedWorkouts = previousWorkouts
          .map((w) =>
            orderMap.has(w.id) ? { ...w, order_index: orderMap.get(w.id)! } : w
          )
          .sort((a, b) => a.order_index - b.order_index);

        queryClient.setQueryData(workoutKeys.list(user.id), optimizedWorkouts);
      }

      return { previousWorkouts };
    },
    onError: (err, _, context) => {
      if (user?.id && context?.previousWorkouts) {
        queryClient.setQueryData(
          workoutKeys.list(user.id),
          context.previousWorkouts
        );
      }
      console.error("Error reordering workouts:", err);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: workoutKeys.list(user.id) });
      }
    },
  });
}
