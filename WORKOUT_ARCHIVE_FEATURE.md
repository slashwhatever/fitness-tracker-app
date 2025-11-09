# Workout Archive Feature

## Overview

This feature allows users to archive workouts to reduce clutter on the home screen. Archived workouts are hidden from the main workout list but can be easily unarchived when needed.

## Implementation Details

### Database Changes

**Migration: `40-add-workout-archived.sql`**
- Added `archived` boolean column to the `workouts` table (defaults to `false`)
- Added index on `(user_id, archived, order_index)` for efficient filtering
- The archived column is properly documented in the database schema

### Code Changes

#### 1. Database Types (`src/lib/supabase/database.types.ts`)
- Updated the `workouts` table type definition to include the `archived` field
- Added to Row, Insert, and Update types

#### 2. Hook Updates (`src/hooks/useWorkouts.ts`)
- Added new `useArchiveWorkout()` mutation hook
- Supports both archiving and unarchiving workouts
- Includes optimistic updates for instant UI feedback
- Properly invalidates queries on success/error

#### 3. UI Components

**WorkoutList (`src/components/common/WorkoutList.tsx`)**
- Separates workouts into active and archived lists
- Active workouts display at the top with drag-and-drop reordering
- Archived workouts appear in a collapsible section below active workouts
- Shows appropriate empty states for each section
- Only active workouts can be reordered via drag-and-drop

**SortableWorkoutItem (`src/components/common/SortableWorkoutItem.tsx`)**
- Added archive/unarchive button
- Archive button (Archive icon) for active workouts
- Unarchive button (ArchiveRestore icon) for archived workouts
- Drag handle is hidden for archived workouts
- Proper spacing adjustments for archived items

## User Experience

### Archiving a Workout
1. From the home screen, locate an active workout
2. Click the "Archive" button (archive icon)
3. The workout immediately moves to the "Archived workouts" section below

### Unarchiving a Workout
1. Expand the "Archived workouts" section (if collapsed)
2. Click the "Unarchive" button (restore icon) on the archived workout
3. The workout immediately returns to the active workouts list

### Visual Organization
- **Active Workouts**: Full drag-and-drop functionality, visible by default
- **Archived Section**: Collapsible section showing count, e.g., "Archived workouts (3)"
- **Empty States**: 
  - When no active workouts: "All workouts are archived"
  - When no workouts at all: "No workouts created yet"

## Running the Migration

To apply the database changes:

```bash
# Connect to your Supabase database and run:
psql -h your-db-host -U postgres -d postgres -f database/40-add-workout-archived.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `database/40-add-workout-archived.sql`
3. Run the query

## Technical Notes

- Archived workouts maintain their `order_index` but are not shown in the drag-and-drop context
- Reordering only affects active workouts
- Archive/unarchive operations use optimistic updates for instant feedback
- The collapsible component is from shadcn/ui (already in the project)
- Follows existing patterns for mutations and query invalidation

## Future Enhancements (Optional)

Potential improvements that could be added:
- Bulk archive/unarchive operations
- Auto-archive workouts after a certain period of inactivity
- Search/filter within archived workouts
- Separate page for viewing all archived workouts
