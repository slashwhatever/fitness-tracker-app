-- ============================================================================
-- SAFE MIGRATION: Convert muscle_group to muscle_groups array
-- ============================================================================
-- This migration safely updates the database schema to support multiple muscle groups

-- Check what columns currently exist
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name IN ('movement_templates', 'user_movements') 
-- AND table_schema = 'public'
-- ORDER BY table_name, column_name;

-- Add muscle_groups columns only if they don't exist
DO $$
BEGIN
    -- Add muscle_groups to movement_templates if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'movement_templates' 
        AND column_name = 'muscle_groups' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.movement_templates ADD COLUMN muscle_groups TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added muscle_groups column to movement_templates';
    ELSE
        RAISE NOTICE 'muscle_groups column already exists in movement_templates';
    END IF;

    -- Add muscle_groups to user_movements if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_movements' 
        AND column_name = 'muscle_groups' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_movements ADD COLUMN muscle_groups TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added muscle_groups column to user_movements';
    ELSE
        RAISE NOTICE 'muscle_groups column already exists in user_movements';
    END IF;
END
$$;

-- Convert existing singular muscle_group data to arrays if muscle_group columns exist
DO $$
BEGIN
    -- For movement_templates
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'movement_templates' 
        AND column_name = 'muscle_group' 
        AND table_schema = 'public'
    ) THEN
        UPDATE public.movement_templates 
        SET muscle_groups = ARRAY[muscle_group] 
        WHERE muscle_group IS NOT NULL AND (muscle_groups IS NULL OR muscle_groups = '{}');
        RAISE NOTICE 'Converted muscle_group to muscle_groups for movement_templates';
    ELSE
        RAISE NOTICE 'muscle_group column does not exist in movement_templates - skipping conversion';
    END IF;

    -- For user_movements
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_movements' 
        AND column_name = 'muscle_group' 
        AND table_schema = 'public'
    ) THEN
        UPDATE public.user_movements 
        SET muscle_groups = ARRAY[muscle_group] 
        WHERE muscle_group IS NOT NULL AND (muscle_groups IS NULL OR muscle_groups = '{}');
        RAISE NOTICE 'Converted muscle_group to muscle_groups for user_movements';
    ELSE
        RAISE NOTICE 'muscle_group column does not exist in user_movements - skipping conversion';
    END IF;
END
$$;

-- Make muscle_groups columns non-null if they have data
DO $$
BEGIN
    -- For movement_templates
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'movement_templates' 
        AND column_name = 'muscle_groups' 
        AND table_schema = 'public'
        AND is_nullable = 'YES'
    ) THEN
        -- Set empty arrays for any null values
        UPDATE public.movement_templates SET muscle_groups = '{}' WHERE muscle_groups IS NULL;
        ALTER TABLE public.movement_templates ALTER COLUMN muscle_groups SET NOT NULL;
        RAISE NOTICE 'Set muscle_groups as NOT NULL for movement_templates';
    END IF;

    -- For user_movements
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_movements' 
        AND column_name = 'muscle_groups' 
        AND table_schema = 'public'
        AND is_nullable = 'YES'
    ) THEN
        -- Set empty arrays for any null values
        UPDATE public.user_movements SET muscle_groups = '{}' WHERE muscle_groups IS NULL;
        ALTER TABLE public.user_movements ALTER COLUMN muscle_groups SET NOT NULL;
        RAISE NOTICE 'Set muscle_groups as NOT NULL for user_movements';
    END IF;
END
$$;

-- Drop old singular muscle_group columns if they exist
DO $$
BEGIN
    -- Drop from movement_templates
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'movement_templates' 
        AND column_name = 'muscle_group' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.movement_templates DROP COLUMN muscle_group;
        RAISE NOTICE 'Dropped muscle_group column from movement_templates';
    END IF;

    -- Drop from user_movements
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_movements' 
        AND column_name = 'muscle_group' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_movements DROP COLUMN muscle_group;
        RAISE NOTICE 'Dropped muscle_group column from user_movements';
    END IF;
END
$$;

-- Update constraints
DO $$
BEGIN
    -- Drop old constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'movement_templates_name_muscle_group_key' 
        AND table_name = 'movement_templates'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.movement_templates DROP CONSTRAINT movement_templates_name_muscle_group_key;
        RAISE NOTICE 'Dropped old constraint movement_templates_name_muscle_group_key';
    END IF;

    -- Add new constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'movement_templates_name_key' 
        AND table_name = 'movement_templates'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.movement_templates ADD CONSTRAINT movement_templates_name_key UNIQUE(name);
        RAISE NOTICE 'Added new constraint movement_templates_name_key';
    END IF;
END
$$;
