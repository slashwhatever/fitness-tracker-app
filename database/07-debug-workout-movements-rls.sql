-- ============================================================================
-- DEBUG WORKOUT_MOVEMENTS RLS ISSUE
-- ============================================================================
-- This script helps diagnose why workout_movements inserts are failing

-- Check current user authentication
SELECT 'Current auth.uid():' as info, auth.uid() as user_id;

-- Check if the failing workout exists
SELECT 'Workout exists check:' as info;
SELECT id, user_id, name, created_at 
FROM public.workouts 
WHERE id = '9874f44e-257d-4cee-b7e9-ef526d5d48fe';

-- Check all workouts for this user
SELECT 'All workouts for user:' as info;
SELECT id, user_id, name, created_at 
FROM public.workouts 
WHERE user_id = 'bde6389e-d7bc-4d2a-a1f1-bc6452c91973'
ORDER BY created_at DESC;

-- Check current RLS policies on workout_movements
SELECT 'Current workout_movements policies:' as info;
SELECT policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'workout_movements'
ORDER BY policyname;

-- Test the specific RLS condition manually
SELECT 'RLS condition test:' as info;
SELECT EXISTS (
  SELECT 1 FROM public.workouts 
  WHERE workouts.id = '9874f44e-257d-4cee-b7e9-ef526d5d48fe'
  AND workouts.user_id = auth.uid()
) as rls_condition_passes;

-- Show what workout_movements currently exist
SELECT 'Current workout_movements:' as info;
SELECT wm.id, wm.workout_id, wm.user_movement_id, wm.order_index,
       w.name as workout_name, w.user_id as workout_owner
FROM public.workout_movements wm
LEFT JOIN public.workouts w ON wm.workout_id = w.id
ORDER BY wm.created_at DESC
LIMIT 10;
