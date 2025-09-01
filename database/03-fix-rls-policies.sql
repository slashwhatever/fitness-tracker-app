-- ============================================================================
-- FIX ROW LEVEL SECURITY POLICIES
-- ============================================================================
-- This script ensures users can insert their own data while maintaining security

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movement_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_operations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

DROP POLICY IF EXISTS "Everyone can view movement templates" ON public.movement_templates;
DROP POLICY IF EXISTS "Users can manage their own movements" ON public.user_movements;
DROP POLICY IF EXISTS "Users can view their own movements" ON public.user_movements;
DROP POLICY IF EXISTS "Users can insert their own movements" ON public.user_movements;
DROP POLICY IF EXISTS "Users can update their own movements" ON public.user_movements;
DROP POLICY IF EXISTS "Users can delete their own movements" ON public.user_movements;

DROP POLICY IF EXISTS "Users can manage their own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can view their own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can insert their own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can update their own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can delete their own workouts" ON public.workouts;

DROP POLICY IF EXISTS "Users can manage their own workout movements" ON public.workout_movements;
DROP POLICY IF EXISTS "Users can view their own workout movements" ON public.workout_movements;
DROP POLICY IF EXISTS "Users can insert their own workout movements" ON public.workout_movements;
DROP POLICY IF EXISTS "Users can update their own workout movements" ON public.workout_movements;
DROP POLICY IF EXISTS "Users can delete their own workout movements" ON public.workout_movements;

DROP POLICY IF EXISTS "Users can manage their own sets" ON public.sets;
DROP POLICY IF EXISTS "Users can view their own sets" ON public.sets;
DROP POLICY IF EXISTS "Users can insert their own sets" ON public.sets;
DROP POLICY IF EXISTS "Users can update their own sets" ON public.sets;
DROP POLICY IF EXISTS "Users can delete their own sets" ON public.sets;

-- USER PROFILES policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- MOVEMENT TEMPLATES policies (global library - everyone can read)
CREATE POLICY "Everyone can view movement templates" ON public.movement_templates
  FOR SELECT USING (true);

-- USER MOVEMENTS policies
CREATE POLICY "Users can view their own movements" ON public.user_movements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own movements" ON public.user_movements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own movements" ON public.user_movements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own movements" ON public.user_movements
  FOR DELETE USING (auth.uid() = user_id);

-- WORKOUTS policies
CREATE POLICY "Users can view their own workouts" ON public.workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workouts" ON public.workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts" ON public.workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts" ON public.workouts
  FOR DELETE USING (auth.uid() = user_id);

-- WORKOUT MOVEMENTS policies (via workout ownership)
CREATE POLICY "Users can view their own workout movements" ON public.workout_movements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE workouts.id = workout_movements.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own workout movements" ON public.workout_movements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE workouts.id = workout_movements.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own workout movements" ON public.workout_movements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE workouts.id = workout_movements.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own workout movements" ON public.workout_movements
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE workouts.id = workout_movements.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

-- SETS policies
CREATE POLICY "Users can view their own sets" ON public.sets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sets" ON public.sets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sets" ON public.sets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sets" ON public.sets
  FOR DELETE USING (auth.uid() = user_id);

-- PERSONAL RECORDS policies
CREATE POLICY "Users can view their own records" ON public.personal_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own records" ON public.personal_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records" ON public.personal_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own records" ON public.personal_records
  FOR DELETE USING (auth.uid() = user_id);

-- ANALYTICS EVENTS policies
CREATE POLICY "Users can view their own analytics" ON public.analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- SYNC OPERATIONS policies
CREATE POLICY "Users can view their own sync operations" ON public.sync_operations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync operations" ON public.sync_operations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync operations" ON public.sync_operations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sync operations" ON public.sync_operations
  FOR DELETE USING (auth.uid() = user_id);
