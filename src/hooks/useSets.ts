"use client";

import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/types";
import type { QueryData } from '@supabase/supabase-js';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type SetInsert = TablesInsert<"sets">;
type SetUpdate = TablesUpdate<"sets">;

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

// Get all sets for a user
export function useSets() {
  const { user } = useAuth();
  const supabase = createClient();

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

// Get sets for a specific movement
export function useSetsByMovement(movementId: string) {
  const { user } = useAuth();
  const supabase = createClient();

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
  });
}

// Get sets for a specific workout
export function useSetsByWorkout(workoutId: string) {
  const supabase = createClient();

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

// Create a new set
export function useCreateSet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

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
    onSuccess: (data) => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: setKeys.list(user.id) });
        queryClient.invalidateQueries({
          queryKey: setKeys.byMovement(user.id, data.user_movement_id),
        });
        if (data.workout_id) {
          queryClient.invalidateQueries({
            queryKey: setKeys.byWorkout(data.workout_id),
          });
        }
      }
    },
  });
}

// Update a set
export function useUpdateSet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

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
    onSuccess: (data) => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: setKeys.list(user.id) });
        queryClient.invalidateQueries({
          queryKey: setKeys.byMovement(user.id, data.user_movement_id),
        });
        if (data.workout_id) {
          queryClient.invalidateQueries({
            queryKey: setKeys.byWorkout(data.workout_id),
          });
        }
        queryClient.setQueryData(setKeys.detail(data.id), data);
      }
    },
  });
}

// Delete a set
export function useDeleteSet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

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
    onSuccess: ({ setId, setData }) => {
      if (user?.id && setData) {
        queryClient.invalidateQueries({ queryKey: setKeys.list(user.id) });
        queryClient.invalidateQueries({
          queryKey: setKeys.byMovement(user.id, setData.user_movement_id),
        });
        if (setData.workout_id) {
          queryClient.invalidateQueries({
            queryKey: setKeys.byWorkout(setData.workout_id),
          });
        }
        queryClient.removeQueries({ queryKey: setKeys.detail(setId) });
      }
    },
  });
}
