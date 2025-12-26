"use client";

import type { QueryData } from "@supabase/supabase-js";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { createClient } from "../lib/supabase/client";
import type { Tables } from "../lib/supabase/types";

// Query keys
const trackingTypeKeys = {
  all: ["tracking_types"] as const,
  active: () => [...trackingTypeKeys.all, "active"] as const,
};

// Get all active tracking types
export function useTrackingTypes(): UseQueryResult<
  Tables<"tracking_types">[],
  Error
> {
  const supabase = createClient();

  return useQuery({
    queryKey: trackingTypeKeys.active(),
    queryFn: async () => {
      const query = supabase
        .from("tracking_types")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      type QueryResult = QueryData<typeof query>;

      const { data, error } = await query;
      if (error) throw error;
      return data as QueryResult;
    },
  });
}
