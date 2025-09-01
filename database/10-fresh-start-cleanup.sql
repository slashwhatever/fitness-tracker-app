-- ============================================================================
-- FRESH START - CLEAN DATABASE (KEEP MOVEMENT LIBRARY)
-- ============================================================================
-- This script removes all user data but preserves the movement library

-- Step 1: Drop all user data (in dependency order)
DELETE FROM public.sets;
DELETE FROM public.workout_movements;
DELETE FROM public.personal_records;
DELETE FROM public.analytics_events;
DELETE FROM public.sync_operations;
DELETE FROM public.user_movements;
DELETE FROM public.workouts;
DELETE FROM public.user_profiles;

-- Note: Keeping movement_templates (movement library) intact

-- Step 2: Verify cleanup but show movement library is preserved
SELECT 'Data cleanup verification:' as status;
SELECT 'user_profiles' as table_name, COUNT(*) as record_count FROM public.user_profiles
UNION ALL
SELECT 'movement_templates', COUNT(*) FROM public.movement_templates
UNION ALL
SELECT 'user_movements', COUNT(*) FROM public.user_movements
UNION ALL
SELECT 'workouts', COUNT(*) FROM public.workouts
UNION ALL
SELECT 'workout_movements', COUNT(*) FROM public.workout_movements
UNION ALL
SELECT 'sets', COUNT(*) FROM public.sets
UNION ALL
SELECT 'personal_records', COUNT(*) FROM public.personal_records
UNION ALL
SELECT 'analytics_events', COUNT(*) FROM public.analytics_events
UNION ALL
SELECT 'sync_operations', COUNT(*) FROM public.sync_operations
ORDER BY table_name;

-- All counts should be 0 except movement_templates
SELECT 'Database cleaned! Movement library preserved.' as status;
SELECT COUNT(*) || ' movement templates preserved' as movement_library_status 
FROM public.movement_templates;
