# Database Schema

This directory contains the database schema and migration files for the fitness tracking app.

## Files

- `01-initial-schema.sql` - Complete initial database setup including tables, indexes, RLS policies, and seed data

## Setup Instructions

### First Time Setup

1. **Go to your Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the contents of `01-initial-schema.sql`**
4. **Click "Run"** to execute the schema

This will create:

- All necessary tables and relationships
- Row Level Security (RLS) policies for data protection
- Performance indexes
- Automatic timestamp triggers
- Seed data with common exercises

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
