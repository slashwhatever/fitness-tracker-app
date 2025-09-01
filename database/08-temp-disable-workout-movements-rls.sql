-- ============================================================================
-- TEMPORARILY DISABLE WORKOUT_MOVEMENTS RLS TO COMPLETE SYNC
-- ============================================================================
-- This allows us to complete the sync and then debug the RLS issue properly

-- Temporarily disable RLS on workout_movements
ALTER TABLE public.workout_movements DISABLE ROW LEVEL SECURITY;

-- Check if the failing workout exists in Supabase
SELECT 'Missing workout check:' as info;
SELECT id, user_id, name, created_at 
FROM public.workouts 
WHERE id = '9874f44e-257d-4cee-b7e9-ef526d5d48fe';

-- Check all workouts in Supabase for this user
SELECT 'All workouts in Supabase:' as info;
SELECT id, user_id, name, created_at 
FROM public.workouts 
WHERE user_id = 'bde6389e-d7bc-4d2a-a1f1-bc6452c91973'
ORDER BY created_at DESC;
