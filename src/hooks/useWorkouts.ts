"use client";

import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/types";
import { isSafeForQueries } from "@/lib/utils/validation";
import type { QueryData } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Workout = Tables<"workouts">;
type WorkoutInsert = TablesInsert<"workouts">;
type WorkoutUpdate = TablesUpdate<"workouts">;

// Query keys
const workoutKeys = {
  all: ["workouts"] as const,
  lists: () => [...workoutKeys.all, "list"] as const,
  list: (userId: string) => [...workoutKeys.lists(), userId] as const,
  details: () => [...workoutKeys.all, "detail"] as const,
  detail: (id: string) => [...workoutKeys.details(), id] as const,
};

// Get all workouts for a user
export function useWorkouts() {
  const { user } = useAuth();
  const supabase = createClient();

  return useQuery({
    queryKey: workoutKeys.list(user?.id || ""),
    queryFn: async () => {
      if (!user?.id) return [];

      const query = supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("order_index", { ascending: true });

      type QueryResult = QueryData<typeof query>;

      const { data, error } = await query;
      if (error) throw error;
      return data as QueryResult;
    },
    enabled: !!user?.id,
    // Workout list changes moderately - cache for reasonable time
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    // Always refetch on mount to ensure fresh data when returning to dashboard
    refetchOnMount: "always",
  });
}

// Get a single workout
export function useWorkout(workoutId: string) {
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
    // Individual workout details don't change often during active session
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}

// Create a new workout
export function useCreateWorkout() {
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
    onMutate: async (newWorkout) => {
      if (!user?.id) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: workoutKeys.list(user.id) });

      // Snapshot the previous value
      const previousWorkouts = queryClient.getQueryData(
        workoutKeys.list(user.id)
      );

      // Optimistically update to the new value
      const optimisticWorkout = {
        id: `temp-${Date.now()}`,
        ...newWorkout,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData(workoutKeys.list(user.id), (old: unknown[]) => [
        optimisticWorkout,
        ...(old || []),
      ]);

      return { previousWorkouts };
    },
    onError: (err, newWorkout, context) => {
      // If the mutation fails, roll back
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
        // Update the cache with the real data from the server
        const previousWorkouts = queryClient.getQueryData<Workout[]>(
          workoutKeys.list(user.id)
        );
        if (previousWorkouts) {
          // Replace optimistic workout with real data
          const updatedWorkouts = previousWorkouts.map((w) =>
            w.id.toString().startsWith("temp-") ? data : w
          );
          queryClient.setQueryData(workoutKeys.list(user.id), updatedWorkouts);
        }
        // Set individual workout detail
        queryClient.setQueryData(workoutKeys.detail(data.id), data);
      }
    },
  });
}

// Update a workout
export function useUpdateWorkout() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: WorkoutUpdate;
    }) => {
      const { data, error } = await supabase
        .from("workouts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (user?.id) {
        // Update the individual workout in the list cache
        queryClient.setQueryData(
          workoutKeys.list(user.id),
          (old: Workout[] | undefined) => {
            if (!old) return old;
            return old.map((w) => (w.id === data.id ? data : w));
          }
        );
        // Update the detail cache
        queryClient.setQueryData(workoutKeys.detail(data.id), data);
      }
    },
  });
}

// Delete a workout
export function useDeleteWorkout() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (workoutId: string) => {
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", workoutId);

      if (error) throw error;
      return workoutId;
    },
    onMutate: async (workoutId) => {
      if (!user?.id) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: workoutKeys.list(user.id) });

      // Snapshot the previous value
      const previousWorkouts = queryClient.getQueryData(
        workoutKeys.list(user.id)
      );

      // Optimistically remove the workout
      queryClient.setQueryData(workoutKeys.list(user.id), (old: unknown[]) =>
        (old || []).filter(
          (workout: unknown) =>
            typeof workout === "object" &&
            workout !== null &&
            "id" in workout &&
            (workout as { id: string }).id !== workoutId
        )
      );

      return { previousWorkouts };
    },
    onError: (err, workoutId, context) => {
      // If the mutation fails, roll back
      if (user?.id) {
        queryClient.setQueryData(
          workoutKeys.list(user.id),
          context?.previousWorkouts
        );
      }
      console.error("Error deleting workout:", err);
    },
    onSuccess: (workoutId) => {
      if (user?.id && workoutId) {
        // Remove from detail cache
        queryClient.removeQueries({
          queryKey: workoutKeys.detail(workoutId),
        });
      }
    },
  });
}

// Reorder workouts
export function useReorderWorkouts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      workouts,
    }: {
      workouts: { id: string; order_index: number }[];
    }) => {
      // Update all workouts with their new order_index
      const promises = workouts.map(({ id, order_index }) =>
        supabase.from("workouts").update({ order_index }).eq("id", id)
      );

      const results = await Promise.all(promises);
      const error = results.find((result) => result.error)?.error;
      if (error) throw error;

      return workouts;
    },
    onMutate: async ({ workouts: reorderedWorkouts }) => {
      if (!user?.id) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: workoutKeys.list(user.id),
      });

      // Snapshot the previous value
      const previousWorkouts = queryClient.getQueryData(
        workoutKeys.list(user.id)
      ) as unknown[] | undefined;

      if (previousWorkouts) {
        // Create new order map
        const orderMap = new Map(
          reorderedWorkouts.map((w) => [w.id, w.order_index])
        );

        // Optimistically update with new order
        const reorderedList = [...previousWorkouts]
          .map((workout) => {
            if (
              typeof workout === "object" &&
              workout !== null &&
              "id" in workout
            ) {
              const newOrder = orderMap.get((workout as { id: string }).id);
              return newOrder !== undefined
                ? { ...workout, order_index: newOrder }
                : workout;
            }
            return workout;
          })
          .sort((a, b) => {
            if (
              typeof a === "object" &&
              a !== null &&
              "order_index" in a &&
              typeof b === "object" &&
              b !== null &&
              "order_index" in b
            ) {
              return (
                (a as { order_index: number }).order_index -
                (b as { order_index: number }).order_index
              );
            }
            return 0;
          });

        queryClient.setQueryData(workoutKeys.list(user.id), reorderedList);
      }

      return { previousWorkouts };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, roll back
      if (user?.id && context?.previousWorkouts) {
        queryClient.setQueryData(
          workoutKeys.list(user.id),
          context.previousWorkouts
        );
      }
      console.error("Error reordering workouts:", err);
    },
  });
}

// Archive/Unarchive a workout
export function useArchiveWorkout() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      workoutId,
      archived,
    }: {
      workoutId: string;
      archived: boolean;
    }) => {
      const { data, error } = await supabase
        .from("workouts")
        .update({ archived })
        .eq("id", workoutId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ workoutId, archived }) => {
      if (!user?.id) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: workoutKeys.list(user.id) });

      // Snapshot the previous value
      const previousWorkouts = queryClient.getQueryData(
        workoutKeys.list(user.id)
      ) as unknown[] | undefined;

      // Optimistically update the workout's archived status
      if (previousWorkouts) {
        const updatedWorkouts = previousWorkouts.map((workout) => {
          if (
            typeof workout === "object" &&
            workout !== null &&
            "id" in workout &&
            (workout as { id: string }).id === workoutId
          ) {
            return { ...workout, archived };
          }
          return workout;
        });

        queryClient.setQueryData(workoutKeys.list(user.id), updatedWorkouts);
      }

      return { previousWorkouts };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, roll back
      if (user?.id && context?.previousWorkouts) {
        queryClient.setQueryData(
          workoutKeys.list(user.id),
          context.previousWorkouts
        );
      }
      console.error("Error archiving/unarchiving workout:", err);
    },
    onSuccess: (data) => {
      if (user?.id) {
        // Update the workout in the list cache with server response
        queryClient.setQueryData(
          workoutKeys.list(user.id),
          (old: Workout[] | undefined) => {
            if (!old) return old;
            return old.map((w) => (w.id === data.id ? data : w));
          }
        );
        // Update the detail cache
        queryClient.setQueryData(workoutKeys.detail(data.id), data);
      }
    },
  });
}
