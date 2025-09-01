'use client';

import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/types';

type UserMovement = Tables<'user_movements'>;
type UserMovementInsert = TablesInsert<'user_movements'>;
type UserMovementUpdate = TablesUpdate<'user_movements'>;
type WorkoutMovement = Tables<'workout_movements'>;
type WorkoutMovementInsert = TablesInsert<'workout_movements'>;
type MovementTemplate = Tables<'movement_templates'>;

// Query keys
const movementKeys = {
  all: ['movements'] as const,
  templates: () => [...movementKeys.all, 'templates'] as const,
  userMovements: () => [...movementKeys.all, 'user'] as const,
  userMovementsList: (userId: string) => [...movementKeys.userMovements(), userId] as const,
  userMovement: (id: string) => [...movementKeys.userMovements(), id] as const,
  workoutMovements: () => [...movementKeys.all, 'workout'] as const,
  workoutMovementsList: (workoutId: string) => [...movementKeys.workoutMovements(), workoutId] as const,
};

// Get all movement templates from database (replaces local TypeScript file)
export function useMovementTemplates() {
  const supabase = createClient();

  return useQuery({
    queryKey: movementKeys.templates(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movement_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as MovementTemplate[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - templates don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get all user movements
export function useUserMovements() {
  const { user } = useAuth();
  const supabase = createClient();

  return useQuery({
    queryKey: movementKeys.userMovementsList(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_movements')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      return data as UserMovement[];
    },
    enabled: !!user?.id,
  });
}

// Get a single user movement
export function useUserMovement(movementId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: movementKeys.userMovement(movementId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_movements')
        .select('*')
        .eq('id', movementId)
        .single();

      if (error) throw error;
      return data as UserMovement;
    },
    enabled: !!movementId,
  });
}

// Get workout movements
export function useWorkoutMovements(workoutId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: movementKeys.workoutMovementsList(workoutId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_movements')
        .select(`
          *,
          user_movement:user_movements(*)
        `)
        .eq('workout_id', workoutId)
        .order('order_index');

      if (error) throw error;
      return data;
    },
    enabled: !!workoutId,
  });
}

// Create a new user movement
export function useCreateUserMovement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (movement: Omit<UserMovementInsert, 'user_id'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_movements')
        .insert({
          ...movement,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as UserMovement;
    },
    onMutate: async (newMovement) => {
      if (!user?.id) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: movementKeys.userMovementsList(user.id) });

      // Snapshot the previous value
      const previousUserMovements = queryClient.getQueryData(movementKeys.userMovementsList(user.id));

      // Optimistically update to the new value
      const optimisticMovement = {
        id: `temp-${Date.now()}`,
        ...newMovement,
        user_id: user.id,
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_used_at: null,
        manual_1rm: null,
      };

      queryClient.setQueryData(
        movementKeys.userMovementsList(user.id),
        (old: any[]) => [optimisticMovement, ...(old || [])]
      );

      return { previousUserMovements };
    },
    onError: (err, newMovement, context) => {
      // If the mutation fails, roll back
      if (user?.id) {
        queryClient.setQueryData(movementKeys.userMovementsList(user.id), context?.previousUserMovements);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: movementKeys.userMovementsList(user.id) });
      }
    },
  });
}

// Update a user movement
export function useUpdateUserMovement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UserMovementUpdate }) => {
      const { data, error } = await supabase
        .from('user_movements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as UserMovement;
    },
    onMutate: async ({ id, updates }) => {
      if (!user?.id) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: movementKeys.userMovementsList(user.id) });
      await queryClient.cancelQueries({ queryKey: movementKeys.userMovement(id) });

      // Snapshot the previous values
      const previousUserMovements = queryClient.getQueryData(movementKeys.userMovementsList(user.id));
      const previousMovement = queryClient.getQueryData(movementKeys.userMovement(id));

      // Optimistically update the movement in the list
      queryClient.setQueryData(
        movementKeys.userMovementsList(user.id),
        (old: any[]) => {
          if (!old) return old;
          return old.map((movement: any) => 
            movement.id === id 
              ? { ...movement, ...updates, updated_at: new Date().toISOString() }
              : movement
          );
        }
      );

      // Optimistically update the individual movement
      if (previousMovement) {
        queryClient.setQueryData(
          movementKeys.userMovement(id),
          (old: any) => ({ ...old, ...updates, updated_at: new Date().toISOString() })
        );
      }

      return { previousUserMovements, previousMovement };
    },
    onError: (err, { id }, context) => {
      // If the mutation fails, roll back
      if (user?.id && context) {
        if (context.previousUserMovements) {
          queryClient.setQueryData(movementKeys.userMovementsList(user.id), context.previousUserMovements);
        }
        if (context.previousMovement) {
          queryClient.setQueryData(movementKeys.userMovement(id), context.previousMovement);
        }
      }
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: movementKeys.userMovementsList(user.id) });
        queryClient.invalidateQueries({ queryKey: movementKeys.userMovement(id) });
      }
    },
  });
}

// Add movement to workout
export function useAddMovementToWorkout() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (workoutMovement: WorkoutMovementInsert) => {
      const { data, error } = await supabase
        .from('workout_movements')
        .insert(workoutMovement)
        .select()
        .single();

      if (error) throw error;
      return data as WorkoutMovement;
    },
    onMutate: async (newWorkoutMovement) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: movementKeys.workoutMovementsList(newWorkoutMovement.workout_id) 
      });

      // Snapshot the previous value
      const previousWorkoutMovements = queryClient.getQueryData(
        movementKeys.workoutMovementsList(newWorkoutMovement.workout_id)
      );

      // Optimistically update to the new value
      const optimisticMovement = {
        id: `temp-${Date.now()}-${Math.random()}`, // Unique temporary ID
        ...newWorkoutMovement,
        created_at: new Date().toISOString(),
        user_movement: null, // Will be populated by real response
      };

      queryClient.setQueryData(
        movementKeys.workoutMovementsList(newWorkoutMovement.workout_id),
        (old: any[]) => {
          const sortedList = [...(old || []), optimisticMovement].sort((a, b) => 
            (a.order_index || 0) - (b.order_index || 0)
          );
          return sortedList;
        }
      );

      // Return a context object with the snapshotted value
      return { previousWorkoutMovements };
    },
    onError: (err, newWorkoutMovement, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        movementKeys.workoutMovementsList(newWorkoutMovement.workout_id),
        context?.previousWorkoutMovements
      );
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: movementKeys.workoutMovementsList(variables.workout_id) 
      });
    },
  });
}

// Remove movement from workout
export function useRemoveMovementFromWorkout() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ workoutId, movementId }: { workoutId: string; movementId: string }) => {
      const { error } = await supabase
        .from('workout_movements')
        .delete()
        .eq('workout_id', workoutId)
        .eq('user_movement_id', movementId);

      if (error) throw error;
      return { workoutId, movementId };
    },
    onMutate: async ({ workoutId, movementId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: movementKeys.workoutMovementsList(workoutId) 
      });

      // Snapshot the previous value
      const previousWorkoutMovements = queryClient.getQueryData(
        movementKeys.workoutMovementsList(workoutId)
      );

      // Optimistically remove the movement
      queryClient.setQueryData(
        movementKeys.workoutMovementsList(workoutId),
        (old: any[]) => (old || []).filter(wm => wm.user_movement_id !== movementId)
      );

      return { previousWorkoutMovements };
    },
    onError: (err, { workoutId }, context) => {
      // If the mutation fails, roll back
      queryClient.setQueryData(
        movementKeys.workoutMovementsList(workoutId),
        context?.previousWorkoutMovements
      );
    },
    onSettled: (data, error, { workoutId }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ 
        queryKey: movementKeys.workoutMovementsList(workoutId) 
      });
    },
  });
}