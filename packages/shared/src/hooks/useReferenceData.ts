import { createClient } from "@/lib/supabase/client";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { MuscleGroup, TrackingType } from "../models/types";

// Query keys
export const referenceKeys = {
  all: ["reference"] as const,
  trackingTypes: () => [...referenceKeys.all, "trackingTypes"] as const,
  muscleGroups: () => [...referenceKeys.all, "muscleGroups"] as const,
};

/**
 * Get all tracking types
 */
export function useTrackingTypes(): UseQueryResult<TrackingType[], Error> {
  const supabase = createClient();

  return useQuery({
    queryKey: referenceKeys.trackingTypes(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracking_types")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour - rarely changes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

/**
 * Get all muscle groups
 */
export function useMuscleGroups(): UseQueryResult<MuscleGroup[], Error> {
  const supabase = createClient();

  return useQuery({
    queryKey: referenceKeys.muscleGroups(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("muscle_groups")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour - rarely changes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
