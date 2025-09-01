-- ============================================================================
-- CREATE USER PROFILE AND SEED MOVEMENT TEMPLATES  
-- ============================================================================
-- This ensures the user has a profile and movement templates exist in the database

-- Create user profile for your authenticated user
INSERT INTO public.user_profiles (
  id,
  display_name,
  default_rest_timer,
  weight_unit,
  distance_unit,
  notification_settings,
  privacy_settings,
  created_at,
  updated_at
) VALUES (
  'bde6389e-d7bc-4d2a-a1f1-bc6452c91973',
  'User',
  180,
  'lbs',
  'miles',
  '{
    "workout_reminders": true,
    "achievements": true,
    "rest_timer": true
  }'::jsonb,
  '{
    "profile_visibility": "private",
    "workout_sharing": false
  }'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Seed movement templates with matching static UUIDs
INSERT INTO public.movement_templates (
  id,
  name,
  muscle_groups,
  tracking_type,
  experience_level,
  instructions,
  tags
) VALUES 
-- Chest Exercises
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Bench Press',
  ARRAY['Chest', 'Triceps', 'Shoulders'],
  'weight',
  'Intermediate',
  'Lie on bench, lower bar to chest, press up with control',
  ARRAY['compound', 'strength', 'upper-body']
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567891',
  'Push-ups',
  ARRAY['Chest', 'Triceps', 'Shoulders'],
  'bodyweight',
  'Beginner',
  'Standard push-up form, full range of motion',
  ARRAY['bodyweight', 'compound', 'no-equipment']
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567892',
  'Incline Bench Press',
  ARRAY['Chest', 'Triceps', 'Shoulders'],
  'weight',
  'Intermediate',
  NULL,
  ARRAY['compound', 'strength']
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567893',
  'Dumbbell Flyes',
  ARRAY['Chest'],
  'weight',
  'Intermediate',
  NULL,
  ARRAY['isolation', 'chest']
),
-- Back Exercises
(
  'b2c3d4e5-f6g7-8901-bcde-f12345678901',
  'Deadlift',
  ARRAY['Back', 'Legs', 'Core'],
  'weight',
  'Advanced',
  'Keep back straight, lift with legs and glutes',
  ARRAY['compound', 'strength', 'full-body']
),
(
  'b2c3d4e5-f6g7-8901-bcde-f12345678902',
  'Pull-ups',
  ARRAY['Back', 'Biceps'],
  'bodyweight',
  'Intermediate',
  NULL,
  ARRAY['bodyweight', 'compound']
),
(
  'b2c3d4e5-f6g7-8901-bcde-f12345678903',
  'Bent Over Rows',
  ARRAY['Back', 'Biceps'],
  'weight',
  'Intermediate',
  NULL,
  ARRAY['compound', 'strength']
),
(
  'b2c3d4e5-f6g7-8901-bcde-f12345678904',
  'Lat Pulldowns',
  ARRAY['Back', 'Biceps'],
  'weight',
  'Beginner',
  NULL,
  ARRAY['machine', 'compound']
),
-- Leg Exercises  
(
  'c3d4e5f6-g7h8-9012-cdef-123456789012',
  'Squats',
  ARRAY['Legs', 'Core'],
  'weight',
  'Beginner',
  'Keep feet shoulder width apart, descend until thighs parallel',
  ARRAY['compound', 'strength']
),
(
  'c3d4e5f6-g7h8-9012-cdef-123456789013',
  'Lunges',
  ARRAY['Legs', 'Core'],
  'bodyweight',
  'Beginner',
  NULL,
  ARRAY['bodyweight', 'unilateral']
),
(
  'c3d4e5f6-g7h8-9012-cdef-123456789014',
  'Leg Press',
  ARRAY['Legs'],
  'weight',
  'Beginner',
  NULL,
  ARRAY['machine', 'compound']
),
(
  'c3d4e5f6-g7h8-9012-cdef-123456789015',
  'Calf Raises',
  ARRAY['Legs'],
  'weight',
  'Beginner',
  NULL,
  ARRAY['isolation', 'calves']
),
-- Shoulder Exercises
(
  'd4e5f6g7-h8i9-0123-def1-234567890123',
  'Overhead Press',
  ARRAY['Shoulders', 'Triceps', 'Core'],
  'weight',
  'Intermediate',
  NULL,
  ARRAY['compound', 'strength']
),
(
  'd4e5f6g7-h8i9-0123-def1-234567890124',
  'Lateral Raises',
  ARRAY['Shoulders'],
  'weight',
  'Beginner',
  NULL,
  ARRAY['isolation', 'shoulders']
),
(
  'd4e5f6g7-h8i9-0123-def1-234567890125',
  'Face Pulls',
  ARRAY['Shoulders', 'Back'],
  'weight',
  'Beginner',
  NULL,
  ARRAY['isolation', 'rear-delts']
),
-- Arm Exercises
(
  'e5f6g7h8-i9j0-1234-ef12-345678901234',
  'Bicep Curls',
  ARRAY['Biceps'],
  'weight',
  'Beginner',
  NULL,
  ARRAY['isolation', 'biceps']
),
(
  'e5f6g7h8-i9j0-1234-ef12-345678901235',
  'Tricep Dips',
  ARRAY['Triceps'],
  'bodyweight',
  'Intermediate',
  NULL,
  ARRAY['bodyweight', 'compound']
),
(
  'e5f6g7h8-i9j0-1234-ef12-345678901236',
  'Hammer Curls',
  ARRAY['Biceps', 'Forearms'],
  'weight',
  'Beginner',
  NULL,
  ARRAY['isolation', 'biceps']
),
-- Core Exercises
(
  'f6g7h8i9-j0k1-2345-f123-456789012345',
  'Planks',
  ARRAY['Core'],
  'duration',
  'Beginner',
  NULL,
  ARRAY['isometric', 'core']
),
(
  'f6g7h8i9-j0k1-2345-f123-456789012346',
  'Crunches',
  ARRAY['Core'],
  'bodyweight',
  'Beginner',
  NULL,
  ARRAY['isolation', 'abs']
),
(
  'f6g7h8i9-j0k1-2345-f123-456789012347',
  'Russian Twists',
  ARRAY['Core'],
  'bodyweight',
  'Beginner',
  NULL,
  ARRAY['rotation', 'obliques']
),
-- Cardio Exercises
(
  'g7h8i9j0-k1l2-3456-1234-567890123456',
  'Running',
  ARRAY['Legs', 'Cardio'],
  'distance',
  'Beginner',
  NULL,
  ARRAY['cardio', 'endurance']
),
(
  'g7h8i9j0-k1l2-3456-1234-567890123457',
  'Cycling',
  ARRAY['Legs', 'Cardio'],
  'duration',
  'Beginner',
  NULL,
  ARRAY['cardio', 'low-impact']
),
(
  'g7h8i9j0-k1l2-3456-1234-567890123458',
  'Burpees',
  ARRAY['Full Body', 'Cardio'],
  'bodyweight',
  'Advanced',
  NULL,
  ARRAY['cardio', 'full-body']
)
ON CONFLICT (id) DO UPDATE SET
  muscle_groups = EXCLUDED.muscle_groups,
  tracking_type = EXCLUDED.tracking_type,
  experience_level = EXCLUDED.experience_level,
  instructions = EXCLUDED.instructions,
  tags = EXCLUDED.tags,
  updated_at = NOW();
