import type { QueryData } from "@supabase/supabase-js";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";

import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "../types/database.types";
import type { HookDependencies } from "./types";

type Set = Tables<"sets">;
export type SetInsert = TablesInsert<"sets">;
export type SetUpdate = TablesUpdate<"sets">;

export type SetWithMovement = Tables<"sets"> & {
  user_movement: Tables<"user_movements"> | null;
};

// Query keys
const setKeys = {
  all: ["sets"] as const,
  lists: () => [...setKeys.all, "list"] as const,
  list: (userId: string) => [...setKeys.lists(), userId] as const,
  byMovement: (userId: string, movementId: string) =>
    [...setKeys.lists(), userId, "movement", movementId] as const,
  byWorkout: (workoutId: string) =>
    [...setKeys.lists(), "workout", workoutId] as const,
  details: () => [...setKeys.all, "detail"] as const,
  detail: (id: string) => [...setKeys.details(), id] as const,
};

/**
 * Get all sets for a user
 * @param deps - Platform-specific dependencies (Supabase client, user)
 */
export function useSets(
  deps: HookDependencies
): UseQueryResult<SetWithMovement[], Error> {
  const { user, supabase } = deps;

  return useQuery({
    queryKey: setKeys.list(user?.id || ""),
    queryFn: async () => {
      if (!user?.id) return [];

      const query = supabase
        .from("sets")
        .select(
          `
          *,
          user_movement:user_movements(*)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      type QueryResult = QueryData<typeof query>;

      const { data, error } = await query;
      if (error) throw error;
      return data as QueryResult;
    },
    enabled: !!user?.id,
  });
}

/**
 * Get count of sets for a specific movement
 * @param movementId - Movement ID to count sets for
 * @param deps - Platform-specific dependencies (Supabase client, user)
 */
export function useSetsCountByMovement(
  movementId: string,
  deps: HookDependencies
): UseQueryResult<number, Error> {
  const { user, supabase } = deps;

  return useQuery({
    queryKey: setKeys.byMovement(user?.id || "", movementId),
    queryFn: async () => {
      if (!user?.id) return 0;

      const query = supabase
        .from("sets")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .eq("user_movement_id", movementId);

      const { data, error } = await query;
      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user?.id && !!movementId,
  });
}

/**
 * Get sets for a specific movement
 * @param movementId - Movement ID to fetch sets for
 * @param deps - Platform-specific dependencies (Supabase client, user)
 */
export function useSetsByMovement(
  movementId: string,
  deps: HookDependencies
): UseQueryResult<SetWithMovement[], Error> {
  const { user, supabase } = deps;

  return useQuery({
    queryKey: setKeys.byMovement(user?.id || "", movementId),
    queryFn: async () => {
      if (!user?.id) return [];

      const query = supabase
        .from("sets")
        .select(
          `
          *,
          user_movement:user_movements(*)
        `
        )
        .eq("user_id", user.id)
        .eq("user_movement_id", movementId)
        .order("created_at", { ascending: false });

      type QueryResult = QueryData<typeof query>;

      const { data, error } = await query;
      if (error) throw error;
      return data as QueryResult;
    },
    enabled: !!user?.id && !!movementId,
    staleTime: 1000 * 60 * 2, // 2 minutes - sets data changes more frequently
    gcTime: 1000 * 60 * 5, // 5 minutes garbage collection
  });
}

/**
 * Get sets for a specific workout
 * @param workoutId - Workout ID to fetch sets for
 * @param deps - Platform-specific dependencies (Supabase client, user)
 */
export function useSetsByWorkout(
  workoutId: string,
  deps: HookDependencies
): UseQueryResult<SetWithMovement[], Error> {
  const { supabase } = deps;

  return useQuery({
    queryKey: setKeys.byWorkout(workoutId),
    queryFn: async () => {
      const query = supabase
        .from("sets")
        .select(
          `
          *,
          user_movement:user_movements(*)
        `
        )
        .eq("workout_id", workoutId)
        .order("created_at");

      type QueryResult = QueryData<typeof query>;

      const { data, error } = await query;
      if (error) throw error;
      return data as QueryResult;
    },
    enabled: !!workoutId,
  });
}

/**
 * Create a new set
 * @param deps - Platform-specific dependencies (Supabase client, user)
 */
export function useCreateSet(
  deps: HookDependencies
): UseMutationResult<SetWithMovement, Error, Omit<SetInsert, "user_id">> {
  const { user, supabase } = deps;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (set: Omit<SetInsert, "user_id">) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("sets")
        .insert({
          ...set,
          user_id: user.id,
        })
        .select(
          `
          *,
          user_movement:user_movements(*)
        `
        )
        .single();

      if (error) throw error;
      return data;
    },
    // Optimistic update for better UX
    onMutate: async (newSet) => {
      if (!user?.id) return;

      // Cancel outgoing refetches to avoid conflicts
      await queryClient.cancelQueries({
        queryKey: setKeys.byMovement(user.id, newSet.user_movement_id),
      });

      // Snapshot previous value
      const previousSets = queryClient.getQueryData(
        setKeys.byMovement(user.id, newSet.user_movement_id)
      );

      // Create optimistic set with temporary ID and current timestamp
      const optimisticSet = {
        id: `temp-${Date.now()}`,
        ...newSet,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rpe: null,
      };

      // Optimistically update the cache by adding the new set at the beginning (most recent)
      queryClient.setQueryData(
        setKeys.byMovement(user.id, newSet.user_movement_id),
        (old: unknown) => {
          if (!old || !Array.isArray(old)) return [optimisticSet];
          return [optimisticSet, ...old];
        }
      );

      // Also update the general sets list if it exists
      queryClient.setQueryData(setKeys.list(user.id), (old: unknown) => {
        if (!old || !Array.isArray(old)) return old;
        return [optimisticSet, ...old];
      });

      return { previousSets };
    },
    onError: (err, variables, context) => {
      // Revert optimistic update on error
      if (context?.previousSets && user?.id) {
        queryClient.setQueryData(
          setKeys.byMovement(user.id, variables.user_movement_id),
          context.previousSets
        );
      }
    },
    onSuccess: (data) => {
      if (user?.id) {
        // Replace optimistic set with real server data in main sets list
        queryClient.setQueryData(
          setKeys.list(user.id),
          (old: Set[] | undefined) => {
            if (!old) return [data];
            return old.map((s) =>
              s.id.toString().startsWith("temp-") ? data : s
            );
          }
        );

        // Update the specific movement's sets cache
        queryClient.setQueryData(
          setKeys.byMovement(user.id, data.user_movement_id),
          (old: Set[] | undefined) => {
            if (!old) return [data];
            return old.map((s) =>
              s.id.toString().startsWith("temp-") ? data : s
            );
          }
        );

        // Invalidate movement last sets queries (these are separate queries that need refetching)
        queryClient.invalidateQueries({
          queryKey: ["movement-last-sets", user.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["movement-last-set", user.id, data.user_movement_id],
        });
      }
    },
  });
}

/**
 * Update a set
 * @param deps - Platform-specific dependencies (Supabase client, user)
 */
export function useUpdateSet(
  deps: HookDependencies
): UseMutationResult<
  SetWithMovement,
  Error,
  { id: string; updates: SetUpdate }
> {
  const { user, supabase } = deps;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: SetUpdate }) => {
      const { data, error } = await supabase
        .from("sets")
        .update(updates)
        .eq("id", id)
        .select(
          `
          *,
          user_movement:user_movements(*)
        `
        )
        .single();

      if (error) throw error;
      return data;
    },
    // Optimistic update for better UX
    onMutate: async ({ id, updates }) => {
      if (!user?.id) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: setKeys.list(user.id) });

      // Snapshot previous value
      const previousSets = queryClient.getQueryData(setKeys.list(user.id));

      // Optimistically update
      queryClient.setQueryData(setKeys.list(user.id), (old: unknown) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((set: Record<string, unknown>) =>
          set.id === id ? { ...set, ...updates } : set
        );
      });

      return { previousSets };
    },
    onError: (err, variables, context) => {
      // Revert optimistic update on error
      if (context?.previousSets && user?.id) {
        queryClient.setQueryData(setKeys.list(user.id), context.previousSets);
      }
    },
    onSuccess: (data) => {
      if (user?.id) {
        // Update the main sets list cache with server response
        queryClient.setQueryData(
          setKeys.list(user.id),
          (old: Set[] | undefined) => {
            if (!old) return [data];
            return old.map((s) => (s.id === data.id ? data : s));
          }
        );

        // Update the specific movement's sets cache
        queryClient.setQueryData(
          setKeys.byMovement(user.id, data.user_movement_id),
          (old: Set[] | undefined) => {
            if (!old) return [data];
            return old.map((s) => (s.id === data.id ? data : s));
          }
        );

        // Invalidate movement last sets queries (separate queries that need refetching)
        queryClient.invalidateQueries({
          queryKey: ["movement-last-sets", user.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["movement-last-set", user.id, data.user_movement_id],
        });

        // Update the specific set detail cache
        queryClient.setQueryData(setKeys.detail(data.id), data);
      }
    },
  });
}

/**
 * Delete a set
 * @param deps - Platform-specific dependencies (Supabase client, user)
 */
export function useDeleteSet(deps: HookDependencies): UseMutationResult<
  {
    setId: string;
    setData: { user_movement_id: string; workout_id: string | null } | null;
  },
  Error,
  string
> {
  const { user, supabase } = deps;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (setId: string) => {
      // First get the set data to know which queries to invalidate
      const { data: setData } = await supabase
        .from("sets")
        .select("user_movement_id, workout_id")
        .eq("id", setId)
        .single();

      const { error } = await supabase.from("sets").delete().eq("id", setId);

      if (error) throw error;
      return { setId, setData };
    },
    onMutate: async (setId) => {
      if (!user?.id) return;

      // Find the set in cache to get movement_id for rollback
      const allSets = queryClient.getQueryData<Set[]>(setKeys.list(user.id));
      const setToDelete = allSets?.find((s) => s.id === setId);

      if (!setToDelete) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: setKeys.list(user.id) });
      await queryClient.cancelQueries({
        queryKey: setKeys.byMovement(user.id, setToDelete.user_movement_id),
      });

      // Snapshot the previous values
      const previousSets = allSets;
      const previousMovementSets = queryClient.getQueryData<Set[]>(
        setKeys.byMovement(user.id, setToDelete.user_movement_id)
      );

      // Optimistically remove the set from main list
      queryClient.setQueryData(
        setKeys.list(user.id),
        (old: Set[] | undefined) => (old || []).filter((s) => s.id !== setId)
      );

      // Optimistically remove from movement-specific list
      queryClient.setQueryData(
        setKeys.byMovement(user.id, setToDelete.user_movement_id),
        (old: Set[] | undefined) => (old || []).filter((s) => s.id !== setId)
      );

      return {
        previousSets,
        previousMovementSets,
        movementId: setToDelete.user_movement_id,
      };
    },
    onError: (err, setId, context) => {
      // Roll back on error
      if (user?.id && context) {
        if (context.previousSets) {
          queryClient.setQueryData(setKeys.list(user.id), context.previousSets);
        }
        if (context.previousMovementSets && context.movementId) {
          queryClient.setQueryData(
            setKeys.byMovement(user.id, context.movementId),
            context.previousMovementSets
          );
        }
      }
      console.error("Error deleting set:", err);
    },
    onSuccess: ({ setId, setData }) => {
      if (user?.id && setData) {
        // Invalidate movement last sets queries (separate queries that need refetching)
        queryClient.invalidateQueries({
          queryKey: ["movement-last-sets", user.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["movement-last-set", user.id, setData.user_movement_id],
        });

        // Remove the specific set detail cache
        queryClient.removeQueries({ queryKey: setKeys.detail(setId) });
      }
    },
  });
}
