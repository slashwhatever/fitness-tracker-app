-- ============================================================================
-- ADD WEIGHT_UNIT AND DISTANCE_UNIT TO USER_PROFILES
-- ============================================================================
-- This migration adds the missing weight_unit and distance_unit columns

-- Add weight_unit column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'weight_unit'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN weight_unit TEXT NOT NULL DEFAULT 'lbs';
    END IF;
END $$;

-- Add distance_unit column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'distance_unit'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN distance_unit TEXT NOT NULL DEFAULT 'miles';
    END IF;
END $$;
