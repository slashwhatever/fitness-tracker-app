-- ============================================================================
-- FIX DUPLICATE USER_MOVEMENTS CONSTRAINT VIOLATIONS
-- ============================================================================
-- This script resolves user_movements conflicts by updating existing records to match app expectations

-- First, see what user_movements currently exist in Supabase
SELECT 'Current user_movements in Supabase:' as info;
SELECT id, user_id, template_id, name, muscle_groups, created_at 
FROM public.user_movements 
WHERE user_id = 'bde6389e-d7bc-4d2a-a1f1-bc6452c91973'
ORDER BY name;

-- Check for specific movements that are failing
SELECT 'Checking for Bicep Curls:' as info;
SELECT id, template_id, name 
FROM public.user_movements 
WHERE user_id = 'bde6389e-d7bc-4d2a-a1f1-bc6452c91973' 
AND name = 'Bicep Curls';

SELECT 'Checking for Bent Over Rows:' as info;
SELECT id, template_id, name 
FROM public.user_movements 
WHERE user_id = 'bde6389e-d7bc-4d2a-a1f1-bc6452c91973' 
AND name = 'Bent Over Rows';

-- Update existing user_movements to have the IDs that the app expects
-- This resolves the unique constraint violation by making the existing records match

UPDATE public.user_movements 
SET id = 'cc54da28-a972-4ef7-a3f0-548e946d1c66',
    template_id = 'e5f6a7b8-c9d0-1234-ef12-345678901234'
WHERE user_id = 'bde6389e-d7bc-4d2a-a1f1-bc6452c91973' 
AND name = 'Bicep Curls';

UPDATE public.user_movements 
SET id = '6ac44ed3-069a-48a4-9f1f-6e4e3dbcc4c1',
    template_id = 'b2c3d4e5-f6a7-8901-bcde-f12345678903'
WHERE user_id = 'bde6389e-d7bc-4d2a-a1f1-bc6452c91973' 
AND name = 'Bent Over Rows';

-- Verify the updates
SELECT 'Updated user_movements:' as info;
SELECT id, user_id, template_id, name, muscle_groups, updated_at 
FROM public.user_movements 
WHERE user_id = 'bde6389e-d7bc-4d2a-a1f1-bc6452c91973'
AND name IN ('Bicep Curls', 'Bent Over Rows')
ORDER BY name;
