-- ============================================================================
-- FITNESS TRACKER DATABASE SCHEMA
-- ============================================================================
-- This file creates all tables, enums, and policies for the fitness tracking app
-- Run this in your Supabase SQL editor to set up the complete database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE public.tracking_type AS ENUM (
  'weight',
  'bodyweight', 
  'duration',
  'distance',
  'reps_only'
);

CREATE TYPE public.set_type AS ENUM (
  'warmup',
  'working',
  'drop',
  'failure',
  'rest_pause'
);

CREATE TYPE public.experience_level AS ENUM (
  'Beginner',
  'Intermediate', 
  'Advanced'
);

CREATE TYPE public.record_type AS ENUM (
  'max_weight',
  'max_reps',
  'max_duration',
  'max_volume'
);

CREATE TYPE public.operation_type AS ENUM (
  'INSERT',
  'UPDATE',
  'DELETE'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- User Profiles Table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  default_rest_timer INTEGER NOT NULL DEFAULT 90,
  notification_preferences JSONB NOT NULL DEFAULT '{
    "rest_timer": true,
    "workout_reminders": true,
    "achievements": true
  }'::jsonb,
  privacy_settings JSONB NOT NULL DEFAULT '{
    "profile_visibility": "private",
    "workout_sharing": false
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Movement Templates Table (global movement library)
CREATE TABLE public.movement_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  tracking_type public.tracking_type NOT NULL,
  experience_level public.experience_level NOT NULL,
  instructions TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(name, muscle_group)
);

-- User Movements Table (user's personalized movements)
CREATE TABLE public.user_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.movement_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  tracking_type public.tracking_type NOT NULL,
  personal_notes TEXT,
  manual_1rm DECIMAL,
  custom_rest_timer INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Workouts Table
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  default_rest_timer INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workout Movements Table (movements in a workout template)
CREATE TABLE public.workout_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  user_movement_id UUID NOT NULL REFERENCES public.user_movements(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workout_id, user_movement_id),
  UNIQUE(workout_id, order_index)
);

-- Sets Table (individual set records)
CREATE TABLE public.sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  user_movement_id UUID NOT NULL REFERENCES public.user_movements(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
  set_type public.set_type NOT NULL DEFAULT 'working',
  reps INTEGER,
  weight DECIMAL,
  duration INTEGER, -- in seconds
  distance DECIMAL, -- in meters/km
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workout Sessions Table (actual workout instances)
CREATE TABLE public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Personal Records Table
CREATE TABLE public.personal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  user_movement_id UUID NOT NULL REFERENCES public.user_movements(id) ON DELETE CASCADE,
  record_type public.record_type NOT NULL,
  value DECIMAL NOT NULL,
  set_id UUID NOT NULL REFERENCES public.sets(id) ON DELETE CASCADE,
  achieved_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, user_movement_id, record_type)
);

-- Sync Operations Table (for offline/online sync)
CREATE TABLE public.sync_operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  operation public.operation_type NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  data JSONB NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analytics Events Table
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User Movements indexes
CREATE INDEX idx_user_movements_user_id ON public.user_movements(user_id);
CREATE INDEX idx_user_movements_template_id ON public.user_movements(template_id);
CREATE INDEX idx_user_movements_usage ON public.user_movements(user_id, usage_count DESC, last_used_at DESC);

-- Sets indexes
CREATE INDEX idx_sets_user_id ON public.sets(user_id);
CREATE INDEX idx_sets_user_movement_id ON public.sets(user_movement_id);
CREATE INDEX idx_sets_workout_id ON public.sets(workout_id);
CREATE INDEX idx_sets_created_at ON public.sets(user_id, created_at DESC);

-- Workout Sessions indexes
CREATE INDEX idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_workout_id ON public.workout_sessions(workout_id);
CREATE INDEX idx_workout_sessions_started_at ON public.workout_sessions(user_id, started_at DESC);

-- Personal Records indexes
CREATE INDEX idx_personal_records_user_id ON public.personal_records(user_id);
CREATE INDEX idx_personal_records_movement ON public.personal_records(user_movement_id, record_type);

-- Analytics Events indexes
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(user_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movement_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- User Profiles policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Movement Templates policies (public read, authenticated users only)
CREATE POLICY "Anyone can view movement templates" ON public.movement_templates
  FOR SELECT USING (true);

-- User Movements policies
CREATE POLICY "Users can view their own movements" ON public.user_movements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own movements" ON public.user_movements
  FOR ALL USING (auth.uid() = user_id);

-- Workouts policies
CREATE POLICY "Users can view their own workouts" ON public.workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own workouts" ON public.workouts
  FOR ALL USING (auth.uid() = user_id);

-- Workout Movements policies
CREATE POLICY "Users can view workout movements for their workouts" ON public.workout_movements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE workouts.id = workout_movements.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage workout movements for their workouts" ON public.workout_movements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE workouts.id = workout_movements.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

-- Sets policies
CREATE POLICY "Users can view their own sets" ON public.sets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sets" ON public.sets
  FOR ALL USING (auth.uid() = user_id);

-- Workout Sessions policies
CREATE POLICY "Users can view their own workout sessions" ON public.workout_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own workout sessions" ON public.workout_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Personal Records policies
CREATE POLICY "Users can view their own records" ON public.personal_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own records" ON public.personal_records
  FOR ALL USING (auth.uid() = user_id);

-- Sync Operations policies
CREATE POLICY "Users can view their own sync operations" ON public.sync_operations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sync operations" ON public.sync_operations
  FOR ALL USING (auth.uid() = user_id);

-- Analytics Events policies
CREATE POLICY "Users can view their own analytics" ON public.analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_movement_templates_updated_at
  BEFORE UPDATE ON public.movement_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_movements_updated_at
  BEFORE UPDATE ON public.user_movements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at
  BEFORE UPDATE ON public.workout_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- SEED DATA: BASIC MOVEMENT TEMPLATES
-- ============================================================================

INSERT INTO public.movement_templates (name, muscle_group, tracking_type, experience_level, instructions, tags) VALUES
-- Upper Body
('Push-up', 'Chest', 'bodyweight', 'Beginner', 'Start in plank position, lower body to ground, push back up', ARRAY['bodyweight', 'compound']),
('Bench Press', 'Chest', 'weight', 'Intermediate', 'Lie on bench, press barbell from chest to full extension', ARRAY['barbell', 'compound']),
('Pull-up', 'Back', 'bodyweight', 'Intermediate', 'Hang from bar, pull body up until chin clears bar', ARRAY['bodyweight', 'compound']),
('Bent-over Row', 'Back', 'weight', 'Intermediate', 'Hinge at hips, pull weight to lower chest/upper abdomen', ARRAY['barbell', 'compound']),
('Overhead Press', 'Shoulders', 'weight', 'Intermediate', 'Press weight overhead from shoulder level', ARRAY['barbell', 'compound']),
('Dumbbell Curls', 'Arms', 'weight', 'Beginner', 'Curl dumbbells from extended arms to shoulders', ARRAY['dumbbell', 'isolation']),

-- Lower Body
('Squat', 'Legs', 'weight', 'Beginner', 'Lower body as if sitting in chair, return to standing', ARRAY['barbell', 'compound']),
('Deadlift', 'Legs', 'weight', 'Intermediate', 'Lift weight from ground to hip level with straight back', ARRAY['barbell', 'compound']),
('Lunge', 'Legs', 'bodyweight', 'Beginner', 'Step forward, lower back knee toward ground, return to start', ARRAY['bodyweight', 'unilateral']),
('Leg Press', 'Legs', 'weight', 'Beginner', 'Press weight with feet from seated position', ARRAY['machine', 'compound']),

-- Core
('Plank', 'Core', 'duration', 'Beginner', 'Hold body in straight line from head to heels', ARRAY['bodyweight', 'isometric']),
('Sit-ups', 'Core', 'bodyweight', 'Beginner', 'Lie on back, curl torso toward knees', ARRAY['bodyweight', 'isolation']),

-- Cardio
('Running', 'Cardio', 'distance', 'Beginner', 'Rhythmic running at comfortable pace', ARRAY['cardio', 'endurance']),
('Cycling', 'Cardio', 'duration', 'Beginner', 'Steady cycling for cardiovascular fitness', ARRAY['cardio', 'endurance']);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- This completes the database schema setup
-- Next steps:
-- 1. Enable realtime subscriptions if needed
-- 2. Set up any additional custom functions
-- 3. Configure backups and monitoring
