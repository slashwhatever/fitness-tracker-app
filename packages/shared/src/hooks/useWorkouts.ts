"use client";

import type { QueryData } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../lib/auth/AuthProvider";
import { createClient } from "../lib/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "../lib/supabase/types";
import { isSafeForQueries } from "../lib/utils/validation";

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
    loading: query.isLoading, // Map isLoading to loading for existing consumers
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
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

      await queryClient.cancelQueries({ queryKey: workoutKeys.list(user.id) });

      const previousWorkouts = queryClient.getQueryData(
        workoutKeys.list(user.id)
      );

      const optimisticWorkout = {
        id: `temp-${Date.now()}`,
        ...newWorkout,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData(workoutKeys.list(user.id), (old: any[]) => [
        optimisticWorkout,
        ...(old || []),
      ]);

      return { previousWorkouts };
    },
    onError: (err, newWorkout, context: any) => {
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
        queryClient.setQueryData(
          workoutKeys.list(user.id),
          (old: Workout[] | undefined) => {
            if (!old) return old;
            return old.map((w) => (w.id === data.id ? data : w));
          }
        );
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

      await queryClient.cancelQueries({ queryKey: workoutKeys.list(user.id) });

      const previousWorkouts = queryClient.getQueryData(
        workoutKeys.list(user.id)
      );

      queryClient.setQueryData(workoutKeys.list(user.id), (old: any[]) =>
        (old || []).filter(
          (workout: any) =>
            typeof workout === "object" &&
            workout !== null &&
            "id" in workout &&
            (workout as { id: string }).id !== workoutId
        )
      );

      return { previousWorkouts };
    },
    onError: (err, workoutId, context: any) => {
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

      await queryClient.cancelQueries({
        queryKey: workoutKeys.list(user.id),
      });

      const previousWorkouts = queryClient.getQueryData(
        workoutKeys.list(user.id)
      ) as unknown[] | undefined;

      if (previousWorkouts) {
        const orderMap = new Map(
          reorderedWorkouts.map((w) => [w.id, w.order_index])
        );

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
    onError: (err, variables, context: any) => {
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

      await queryClient.cancelQueries({ queryKey: workoutKeys.list(user.id) });

      const previousWorkouts = queryClient.getQueryData(
        workoutKeys.list(user.id)
      ) as unknown[] | undefined;

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
    onError: (err, variables, context: any) => {
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
        queryClient.setQueryData(
          workoutKeys.list(user.id),
          (old: Workout[] | undefined) => {
            if (!old) return old;
            return old.map((w) => (w.id === data.id ? data : w));
          }
        );
        queryClient.setQueryData(workoutKeys.detail(data.id), data);
      }
    },
  });
}

// Duplicate a workout (including all movements)
export function useDuplicateWorkout() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (workoutId: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data: originalWorkout, error: workoutError } = await supabase
        .from("workouts")
        .select("*")
        .eq("id", workoutId)
        .single();

      if (workoutError) throw workoutError;

      const { data: originalMovements, error: movementsError } = await supabase
        .from("workout_movements")
        .select("user_movement_id, order_index, workout_notes")
        .eq("workout_id", workoutId)
        .order("order_index");

      if (movementsError) throw movementsError;

      const { data: existingWorkouts } = await supabase
        .from("workouts")
        .select("order_index")
        .eq("user_id", user.id)
        .order("order_index", { ascending: false })
        .limit(1);

      const maxOrderIndex = existingWorkouts?.[0]?.order_index ?? -1;

      const { data: newWorkout, error: createError } = await supabase
        .from("workouts")
        .insert({
          name: `${originalWorkout.name} (Copy)`,
          description: originalWorkout.description,
          default_rest_timer: originalWorkout.default_rest_timer,
          user_id: user.id,
          order_index: maxOrderIndex + 1,
          archived: false,
        })
        .select()
        .single();

      if (createError) throw createError;

      if (originalMovements && originalMovements.length > 0) {
        const newMovements = originalMovements.map((movement) => ({
          workout_id: newWorkout.id,
          user_movement_id: movement.user_movement_id,
          order_index: movement.order_index,
          workout_notes: movement.workout_notes,
        }));

        const { error: copyMovementsError } = await supabase
          .from("workout_movements")
          .insert(newMovements);

        if (copyMovementsError) throw copyMovementsError;
      }

      return newWorkout;
    },
    onSuccess: (data) => {
      if (user?.id) {
        queryClient.setQueryData(
          workoutKeys.list(user.id),
          (old: Workout[] | undefined) => {
            if (!old) return [data];
            return [...old, data].sort(
              (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
            );
          }
        );
        queryClient.setQueryData(workoutKeys.detail(data.id), data);
        queryClient.invalidateQueries({
          queryKey: ["workout-movement-counts"],
        });
      }
    },
    onError: (err) => {
      console.error("Error duplicating workout:", err);
    },
  });
}
