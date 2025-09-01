-- ============================================================================
-- MIGRATION: Convert muscle_group to muscle_groups array
-- ============================================================================
-- This migration updates the database schema to support multiple muscle groups
-- per movement, which is better UX design for compound movements

-- First, add the new muscle_groups columns as arrays
ALTER TABLE public.movement_templates 
ADD COLUMN muscle_groups TEXT[] DEFAULT '{}';

ALTER TABLE public.user_movements 
ADD COLUMN muscle_groups TEXT[] DEFAULT '{}';

-- Convert existing singular muscle_group data to arrays
-- For movement_templates
UPDATE public.movement_templates 
SET muscle_groups = ARRAY[muscle_group] 
WHERE muscle_group IS NOT NULL;

-- For user_movements  
UPDATE public.user_movements 
SET muscle_groups = ARRAY[muscle_group] 
WHERE muscle_group IS NOT NULL;

-- Make the new columns non-null now that they have data
ALTER TABLE public.movement_templates 
ALTER COLUMN muscle_groups SET NOT NULL;

ALTER TABLE public.user_movements 
ALTER COLUMN muscle_groups SET NOT NULL;

-- Drop the old singular columns
ALTER TABLE public.movement_templates 
DROP COLUMN muscle_group;

ALTER TABLE public.user_movements 
DROP COLUMN muscle_group;

-- Update the unique constraint on movement_templates
ALTER TABLE public.movement_templates 
DROP CONSTRAINT IF EXISTS movement_templates_name_muscle_group_key;

-- Create new unique constraint (name must be unique regardless of muscle groups)
ALTER TABLE public.movement_templates 
ADD CONSTRAINT movement_templates_name_key UNIQUE(name);
