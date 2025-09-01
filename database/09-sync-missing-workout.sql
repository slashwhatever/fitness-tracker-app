-- ============================================================================
-- MANUALLY SYNC MISSING WORKOUT TO SUPABASE
-- ============================================================================
-- This inserts the missing workout that workout_movements is trying to reference

-- Check what workouts currently exist in Supabase
SELECT 'Workouts currently in Supabase:' as info;
SELECT id, user_id, name, created_at 
FROM public.workouts 
WHERE user_id = 'bde6389e-d7bc-4d2a-a1f1-bc6452c91973'
ORDER BY created_at DESC;

-- Manually insert the missing workout(s) that are referenced by workout_movements
-- You'll need to get the actual workout data from your local storage
-- For now, let's create a placeholder workout with the ID we see in the logs

INSERT INTO public.workouts (
  id,
  user_id,
  name,
  description,
  default_rest_timer,
  created_at,
  updated_at
) VALUES 
(
  'df4698d7-8b2f-4ce8-8ac3-65da5feb0701',
  'bde6389e-d7bc-4d2a-a1f1-bc6452c91973',
  'Workout (Manual Sync)',
  'Manually created to resolve sync dependency',
  180,
  NOW(),
  NOW()
),
(
  '9874f44e-257d-4cee-b7e9-ef526d5d48fe',
  'bde6389e-d7bc-4d2a-a1f1-bc6452c91973',
  'Workout (Manual Sync 2)',
  'Manually created to resolve sync dependency',
  180,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verify the workouts were created
SELECT 'Workouts after manual insert:' as info;
SELECT id, user_id, name, created_at 
FROM public.workouts 
WHERE user_id = 'bde6389e-d7bc-4d2a-a1f1-bc6452c91973'
ORDER BY created_at DESC;
