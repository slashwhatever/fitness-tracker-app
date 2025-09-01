-- ============================================================================
-- CREATE FRESH USER PROFILE
-- ============================================================================
-- Simple user profile creation after fresh start (movement library already exists)

INSERT INTO public.user_profiles (
  id,
  display_name,
  avatar_url,
  default_rest_timer,
  weight_unit,
  distance_unit,
  notification_preferences,
  privacy_settings,
  created_at,
  updated_at
) VALUES (
  'bde6389e-d7bc-4d2a-a1f1-bc6452c91973',
  'User',
  NULL,
  180,
  'lbs',
  'miles',
  '{
    "rest_timer": true,
    "workout_reminders": true,
    "achievements": true
  }'::jsonb,
  '{
    "profile_visibility": "private",
    "workout_sharing": false
  }'::jsonb,
  NOW(),
  NOW()
);

-- Verify profile was created
SELECT 'User profile created:' as status;
SELECT id, display_name, weight_unit, distance_unit, created_at 
FROM public.user_profiles;
