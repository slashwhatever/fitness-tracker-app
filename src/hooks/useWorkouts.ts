'use client';

import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/types';
import { isSafeForQueries } from '@/lib/utils/validation';

type Workout = Tables<'workouts'>;
type WorkoutInsert = TablesInsert<'workouts'>;
type WorkoutUpdate = TablesUpdate<'workouts'>;

// Query keys
const workoutKeys = {
  all: ['workouts'] as const,
  lists: () => [...workoutKeys.all, 'list'] as const,
  list: (userId: string) => [...workoutKeys.lists(), userId] as const,
  details: () => [...workoutKeys.all, 'detail'] as const,
  detail: (id: string) => [...workoutKeys.details(), id] as const,
};

// Get all workouts for a user
export function useWorkouts() {
  const { user } = useAuth();
  const supabase = createClient();

  return useQuery({
    queryKey: workoutKeys.list(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Workout[];
    },
    enabled: !!user?.id,
  });
}

// Get a single workout
export function useWorkout(workoutId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: workoutKeys.detail(workoutId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single();

      if (error) throw error;
      return data as Workout;
    },
    enabled: isSafeForQueries(workoutId),
  });
}

// Create a new workout
export function useCreateWorkout() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (workout: Omit<WorkoutInsert, 'user_id'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workouts')
        .insert({
          ...workout,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Workout;
    },
    onMutate: async (newWorkout) => {
      if (!user?.id) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: workoutKeys.list(user.id) });

      // Snapshot the previous value
      const previousWorkouts = queryClient.getQueryData(workoutKeys.list(user.id));

      // Optimistically update to the new value
      const optimisticWorkout = {
        id: `temp-${Date.now()}`,
        ...newWorkout,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData(
        workoutKeys.list(user.id),
        (old: Workout[]) => [optimisticWorkout, ...(old || [])]
      );

      return { previousWorkouts };
    },
    onError: (err, newWorkout, context) => {
      // If the mutation fails, roll back
      if (user?.id) {
        queryClient.setQueryData(workoutKeys.list(user.id), context?.previousWorkouts);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: workoutKeys.list(user.id) });
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
    mutationFn: async ({ id, updates }: { id: string; updates: WorkoutUpdate }) => {
      const { data, error } = await supabase
        .from('workouts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Workout;
    },
    onSuccess: (data) => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: workoutKeys.list(user.id) });
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
        .from('workouts')
        .delete()
        .eq('id', workoutId);

      if (error) throw error;
      return workoutId;
    },
    onMutate: async (workoutId) => {
      if (!user?.id) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: workoutKeys.list(user.id) });

      // Snapshot the previous value
      const previousWorkouts = queryClient.getQueryData(workoutKeys.list(user.id));

      // Optimistically remove the workout
      queryClient.setQueryData(
        workoutKeys.list(user.id),
        (old: Workout[]) => (old || []).filter((workout: Workout) => workout.id !== workoutId)
      );

      return { previousWorkouts };
    },
    onError: (err, workoutId, context) => {
      // If the mutation fails, roll back
      if (user?.id) {
        queryClient.setQueryData(workoutKeys.list(user.id), context?.previousWorkouts);
      }
    },
    onSettled: (workoutId) => {
      // Always refetch after error or success
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: workoutKeys.list(user.id) });
        if (workoutId) {
          queryClient.removeQueries({ queryKey: workoutKeys.detail(workoutId) });
        }
      }
    },
  });
}