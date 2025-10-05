"use client";

import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Hook to get last set dates for multiple movements efficiently
export function useMovementLastSets(movementIds: string[]) {
  const { user } = useAuth();
  const supabase = createClient();

  return useQuery({
    queryKey: ["movement-last-sets", user?.id, movementIds.sort()],
    queryFn: async () => {
      if (!user?.id || movementIds.length === 0) return [];

      // Use the movement_last_sets table for efficient querying
      const { data, error } = await supabase
        .from("movement_last_sets")
        .select("user_movement_id, last_set_date, total_sets")
        .eq("user_id", user.id)
        .in("user_movement_id", movementIds);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && movementIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes - last set dates don't change frequently
    gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
  });
}

// Hook to get last set date for a single movement
export function useMovementLastSet(movementId: string) {
  const { user } = useAuth();
  const supabase = createClient();

  return useQuery({
    queryKey: ["movement-last-set", user?.id, movementId],
    queryFn: async () => {
      if (!user?.id || !movementId) return null;

      const { data, error } = await supabase
        .from("movement_last_sets")
        .select("last_set_date, total_sets")
        .eq("user_id", user.id)
        .eq("user_movement_id", movementId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // No rows found
        throw error;
      }
      return data;
    },
    enabled: !!user?.id && !!movementId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}
