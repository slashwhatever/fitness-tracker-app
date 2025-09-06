'use client';

import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import type { QueryData } from '@supabase/supabase-js';

export const muscleGroupKeys = {
  all: ['muscleGroups'] as const,
  active: () => [...muscleGroupKeys.all, 'active'] as const,
};

export function useMuscleGroups() {
  const supabase = createClient();
  
  return useQuery({
    queryKey: muscleGroupKeys.active(),
    queryFn: async () => {
      const query = supabase
        .from('muscle_groups')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      type QueryResult = QueryData<typeof query>;
      
      const { data, error } = await query;
      if (error) {
        throw new Error(`Failed to fetch muscle groups: ${error.message}`);
      }

      return data as QueryResult;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}