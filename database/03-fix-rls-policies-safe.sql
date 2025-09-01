-- ============================================================================
-- FIX ROW LEVEL SECURITY POLICIES (SAFE VERSION)
-- ============================================================================
-- This script safely handles existing policies and ensures proper RLS setup

-- First, let's see what policies currently exist (run this to check)
-- SELECT schemaname, tablename, policyname, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- Drop ALL existing policies on our tables (safer approach)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on each table
    FOR r IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('user_profiles', 'movement_templates', 'user_movements', 'workouts', 'workout_movements', 'sets', 'personal_records', 'analytics_events', 'sync_operations')
    LOOP
        EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
        RAISE NOTICE 'Dropped policy % on table %', r.policyname, r.tablename;
    END LOOP;
END
$$;

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movement_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_operations ENABLE ROW LEVEL SECURITY;

-- USER PROFILES policies
CREATE POLICY "users_can_view_own_profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_can_insert_own_profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- MOVEMENT TEMPLATES policies (global library - everyone can read)
CREATE POLICY "everyone_can_view_movement_templates" ON public.movement_templates
  FOR SELECT USING (true);

-- USER MOVEMENTS policies
CREATE POLICY "users_can_view_own_movements" ON public.user_movements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_movements" ON public.user_movements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_movements" ON public.user_movements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_movements" ON public.user_movements
  FOR DELETE USING (auth.uid() = user_id);

-- WORKOUTS policies
CREATE POLICY "users_can_view_own_workouts" ON public.workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_workouts" ON public.workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_workouts" ON public.workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_workouts" ON public.workouts
  FOR DELETE USING (auth.uid() = user_id);

-- WORKOUT MOVEMENTS policies (via workout ownership)
CREATE POLICY "users_can_view_own_workout_movements" ON public.workout_movements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE workouts.id = workout_movements.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "users_can_insert_own_workout_movements" ON public.workout_movements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE workouts.id = workout_movements.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "users_can_update_own_workout_movements" ON public.workout_movements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE workouts.id = workout_movements.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "users_can_delete_own_workout_movements" ON public.workout_movements
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE workouts.id = workout_movements.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

-- SETS policies
CREATE POLICY "users_can_view_own_sets" ON public.sets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_sets" ON public.sets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_sets" ON public.sets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_sets" ON public.sets
  FOR DELETE USING (auth.uid() = user_id);

-- PERSONAL RECORDS policies
CREATE POLICY "users_can_view_own_records" ON public.personal_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_records" ON public.personal_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_records" ON public.personal_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_records" ON public.personal_records
  FOR DELETE USING (auth.uid() = user_id);

-- ANALYTICS EVENTS policies
CREATE POLICY "users_can_view_own_analytics" ON public.analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_analytics" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- SYNC OPERATIONS policies
CREATE POLICY "users_can_view_own_sync_operations" ON public.sync_operations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_sync_operations" ON public.sync_operations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_sync_operations" ON public.sync_operations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_sync_operations" ON public.sync_operations
  FOR DELETE USING (auth.uid() = user_id);
