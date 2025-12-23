"use client";

import { createClient } from "../lib/supabase/client";
import type { QueryData } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

// Query keys
const muscleGroupKeys = {
  all: ["muscle-groups"] as const,
  lists: () => [...muscleGroupKeys.all, "list"] as const,
};

// Get all muscle groups
export function useMuscleGroups() {
  const supabase = createClient();

  return useQuery({
    queryKey: muscleGroupKeys.lists(),
    queryFn: async () => {
      const query = supabase
        .from("muscle_groups")
        .select("*")
        .order("display_name");

      type QueryResult = QueryData<typeof query>;

      const { data, error } = await query;
      if (error) throw error;
      return data as QueryResult;
    },
    staleTime: 60 * 60 * 1000, // 1 hour - muscle groups rarely change
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
