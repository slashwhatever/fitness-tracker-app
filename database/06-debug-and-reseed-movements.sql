-- ============================================================================
-- DEBUG AND RESEED MOVEMENT TEMPLATES
-- ============================================================================
-- This script checks what movement templates exist and reseeds them properly

-- First, let's see what movement templates currently exist
SELECT id, name, muscle_groups, tracking_type, experience_level 
FROM public.movement_templates 
ORDER BY name;

-- Now let's use INSERT ... ON CONFLICT DO UPDATE to ensure all templates exist
-- This will insert if missing, or update if existing

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
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Deadlift',
  ARRAY['Back', 'Legs', 'Core'],
  'weight',
  'Advanced',
  'Keep back straight, lift with legs and glutes',
  ARRAY['compound', 'strength', 'full-body']
),
(
  'b2c3d4e5-f6a7-8901-bcde-f12345678902',
  'Pull-ups',
  ARRAY['Back', 'Biceps'],
  'bodyweight',
  'Intermediate',
  NULL,
  ARRAY['bodyweight', 'compound']
),
(
  'b2c3d4e5-f6a7-8901-bcde-f12345678903',
  'Bent Over Rows',
  ARRAY['Back', 'Biceps'],
  'weight',
  'Intermediate',
  NULL,
  ARRAY['compound', 'strength']
),
(
  'b2c3d4e5-f6a7-8901-bcde-f12345678904',
  'Lat Pulldowns',
  ARRAY['Back', 'Biceps'],
  'weight',
  'Beginner',
  NULL,
  ARRAY['machine', 'compound']
),
-- Leg Exercises  
(
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'Squats',
  ARRAY['Legs', 'Core'],
  'weight',
  'Beginner',
  'Keep feet shoulder width apart, descend until thighs parallel',
  ARRAY['compound', 'strength']
),
(
  'c3d4e5f6-a7b8-9012-cdef-123456789013',
  'Lunges',
  ARRAY['Legs', 'Core'],
  'bodyweight',
  'Beginner',
  NULL,
  ARRAY['bodyweight', 'unilateral']
),
(
  'c3d4e5f6-a7b8-9012-cdef-123456789014',
  'Leg Press',
  ARRAY['Legs'],
  'weight',
  'Beginner',
  NULL,
  ARRAY['machine', 'compound']
),
(
  'c3d4e5f6-a7b8-9012-cdef-123456789015',
  'Calf Raises',
  ARRAY['Legs'],
  'weight',
  'Beginner',
  NULL,
  ARRAY['isolation', 'calves']
),
-- Shoulder Exercises
(
  'd4e5f6a7-b8c9-0123-def1-234567890123',
  'Overhead Press',
  ARRAY['Shoulders', 'Triceps', 'Core'],
  'weight',
  'Intermediate',
  NULL,
  ARRAY['compound', 'strength']
),
(
  'd4e5f6a7-b8c9-0123-def1-234567890124',
  'Lateral Raises',
  ARRAY['Shoulders'],
  'weight',
  'Beginner',
  NULL,
  ARRAY['isolation', 'shoulders']
),
(
  'd4e5f6a7-b8c9-0123-def1-234567890125',
  'Face Pulls',
  ARRAY['Shoulders', 'Back'],
  'weight',
  'Beginner',
  NULL,
  ARRAY['isolation', 'rear-delts']
),
-- Arm Exercises
(
  'e5f6a7b8-c9d0-1234-ef12-345678901234',
  'Bicep Curls',
  ARRAY['Biceps'],
  'weight',
  'Beginner',
  NULL,
  ARRAY['isolation', 'biceps']
),
(
  'e5f6a7b8-c9d0-1234-ef12-345678901235',
  'Tricep Dips',
  ARRAY['Triceps'],
  'bodyweight',
  'Intermediate',
  NULL,
  ARRAY['bodyweight', 'compound']
),
(
  'e5f6a7b8-c9d0-1234-ef12-345678901236',
  'Hammer Curls',
  ARRAY['Biceps', 'Forearms'],
  'weight',
  'Beginner',
  NULL,
  ARRAY['isolation', 'biceps']
),
-- Core Exercises
(
  'f6a7b8c9-d0e1-2345-f123-456789012345',
  'Planks',
  ARRAY['Core'],
  'duration',
  'Beginner',
  NULL,
  ARRAY['isometric', 'core']
),
(
  'f6a7b8c9-d0e1-2345-f123-456789012346',
  'Crunches',
  ARRAY['Core'],
  'bodyweight',
  'Beginner',
  NULL,
  ARRAY['isolation', 'abs']
),
(
  'f6a7b8c9-d0e1-2345-f123-456789012347',
  'Russian Twists',
  ARRAY['Core'],
  'bodyweight',
  'Beginner',
  NULL,
  ARRAY['rotation', 'obliques']
),
-- Cardio Exercises
(
  'a7b8c9d0-e1f2-3456-1234-567890123456',
  'Running',
  ARRAY['Legs', 'Cardio'],
  'distance',
  'Beginner',
  NULL,
  ARRAY['cardio', 'endurance']
),
(
  'a7b8c9d0-e1f2-3456-1234-567890123457',
  'Cycling',
  ARRAY['Legs', 'Cardio'],
  'duration',
  'Beginner',
  NULL,
  ARRAY['cardio', 'low-impact']
),
(
  'a7b8c9d0-e1f2-3456-1234-567890123458',
  'Burpees',
  ARRAY['Full Body', 'Cardio'],
  'bodyweight',
  'Advanced',
  NULL,
  ARRAY['cardio', 'full-body']
)
ON CONFLICT (name) DO UPDATE SET
  id = EXCLUDED.id,
  muscle_groups = EXCLUDED.muscle_groups,
  tracking_type = EXCLUDED.tracking_type,
  experience_level = EXCLUDED.experience_level,
  instructions = EXCLUDED.instructions,
  tags = EXCLUDED.tags,
  updated_at = NOW();

-- Check what was inserted/updated
SELECT 'Movement templates after seeding:' as status;
SELECT id, name, muscle_groups, tracking_type, experience_level 
FROM public.movement_templates 
ORDER BY name;
