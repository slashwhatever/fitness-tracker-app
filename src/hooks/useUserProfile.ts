'use client';

import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/types';

type UserProfile = Tables<'user_profiles'>;
type UserProfileInsert = TablesInsert<'user_profiles'>;
type UserProfileUpdate = TablesUpdate<'user_profiles'>;

// Query keys
const profileKeys = {
  all: ['user_profiles'] as const,
  profile: (userId: string) => [...profileKeys.all, userId] as const,
};

// Get user profile
export function useUserProfile() {
  const { user } = useAuth();
  const supabase = createClient();

  return useQuery({
    queryKey: profileKeys.profile(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // If profile doesn't exist, return null (we'll create it later)
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      return data as UserProfile;
    },
    enabled: !!user?.id,
  });
}

// Create or update user profile
export function useUpsertUserProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (profile: Omit<UserProfileInsert, 'id'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...profile,
        })
        .select()
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    onSuccess: (data) => {
      if (user?.id) {
        queryClient.setQueryData(profileKeys.profile(user.id), data);
      }
    },
  });
}

// Update user profile
export function useUpdateUserProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (updates: UserProfileUpdate) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    onSuccess: (data) => {
      if (user?.id) {
        queryClient.setQueryData(profileKeys.profile(user.id), data);
      }
    },
  });
}