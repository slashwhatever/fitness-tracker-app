# Database Schema

This directory contains the database schema and migration files for the fitness tracking app.

## Files

- `01-initial-schema.sql` - Complete initial database setup including tables, indexes, RLS policies, and seed data

## Database Setup Steps

To set up your Supabase database, run these SQL scripts in order through the Supabase SQL Editor:

### Step 1: Initial Schema

Run `01-initial-schema.sql` to create all tables, enums, and basic structure.

### Step 2: Migrate to Muscle Groups Array

Run `02-migrate-to-muscle-groups-array-safe.sql` to update muscle_group columns to muscle_groups arrays.

### Step 3: Fix RLS Policies

Run `03-fix-rls-policies-safe.sql` to set up Row Level Security policies.

### Step 4: Add User Profile Unit Preferences

Run `05-add-user-profile-units.sql` to add weight_unit and distance_unit columns to user_profiles.

### Step 5: Create User Profile & Seed Movements

Run `04-create-user-profile-and-seed-movements-fixed.sql` to create your user profile and seed movement templates.

### Database Structure

The schema includes these main tables:

- `user_profiles` - User account details and preferences
- `movement_templates` - Global exercise library
- `user_movements` - User's personalized exercises
- `workouts` - Workout templates
- `sets` - Individual set records
- `workout_sessions` - Actual workout instances
- `personal_records` - PR tracking

## Security

- **Row Level Security (RLS)** is enabled on all tables
- Users can only access their own data
- Movement templates are publicly readable
- All policies use `auth.uid()` for user identification

## Future Migrations

For future schema changes, create numbered migration files:

- `02-add-feature.sql`
- `03-update-indexes.sql`
- etc.
