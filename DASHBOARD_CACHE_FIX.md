# Dashboard Cache Invalidation Fix

## Issue
When returning to the main dashboard page after modifying workouts (e.g., adding or removing movements), some workouts would appear to be missing or show stale data. The data would only refresh correctly after a full page refresh.

## Root Cause
The issue was caused by **improper cache invalidation** in React Query:

1. **Missing Query Invalidation**: When movements were added or removed from workouts using mutations like `useAddMovementToWorkout` and `useRemoveMovementFromWorkout`, these mutations were not invalidating the `workout-movement-counts` query that displays movement counts on the dashboard.

2. **Stale Cache Data**: The `workout-movement-counts` query had a 5-minute `staleTime`, and since mutations weren't invalidating it, the dashboard would show outdated movement counts when navigating back.

3. **No Refetch on Mount**: The workouts and movement counts queries were not configured to refetch when the dashboard component remounted after navigation, relying solely on cache invalidation (which wasn't happening).

4. **Disabled Window Focus Refetch**: The global React Query config had `refetchOnWindowFocus: false`, so returning to the dashboard tab wouldn't trigger a refetch either.

## Solution

### 1. Added Cache Invalidation to Movement Mutations

Updated the following mutation hooks in `/src/hooks/useMovements.ts` to invalidate `workout-movement-counts`:

- **`useAddMovementToWorkout`**: Now invalidates movement counts after successfully adding a movement
- **`useRemoveMovementFromWorkout`**: Now invalidates movement counts after successfully removing a movement  
- **`useAddMovementsToWorkout`**: Now invalidates movement counts after batch adding movements
- **`useRemoveMovementsFromWorkout`**: Now invalidates movement counts after batch removing movements

Each mutation now includes:
```typescript
onSuccess: () => {
  // Invalidate workout movement counts so dashboard shows updated counts
  queryClient.invalidateQueries({
    queryKey: ["workout-movement-counts"],
  });
}
```

### 2. Added `refetchOnMount: "always"` to Critical Queries

Updated the following queries to always refetch when their components mount:

- **`useWorkouts`** in `/src/hooks/useWorkouts.ts`: Ensures workout list is fresh when returning to dashboard
- **`useWorkoutMovementCounts`** in `/src/hooks/useWorkoutMovementCounts.ts`: Ensures movement counts are fresh

This provides a safety net that ensures data freshness even if cache invalidation doesn't occur immediately.

## Impact

- ✅ Dashboard now always shows up-to-date workout information when navigating back from other pages
- ✅ Movement counts update correctly after adding/removing movements from workouts
- ✅ No need for manual page refresh to see changes
- ✅ Maintains good performance with intelligent caching while ensuring data freshness
- ✅ Works seamlessly with existing optimistic updates

## Testing Recommendations

1. Navigate to a workout detail page
2. Add or remove several movements
3. Navigate back to the dashboard
4. Verify that the workout movement counts are correct
5. Verify that no workouts are missing from the list

## Related Files Modified

- `/src/hooks/useMovements.ts` - Added cache invalidation to movement mutations
- `/src/hooks/useWorkouts.ts` - Added `refetchOnMount: "always"` to workout list query
- `/src/hooks/useWorkoutMovementCounts.ts` - Added `refetchOnMount: "always"` to movement counts query

---

# "Unknown Movement" Display Fix

## Issue
When adding a movement to a workout, it would initially display as "Unknown Movement" until the page was refreshed. This created a poor user experience and made it unclear whether the operation succeeded.

## Root Cause
The issue was caused by **incomplete data fetching** in mutation responses:

1. **Missing Joined Data**: The mutations (`useAddMovementToWorkout`, `useAddMovementsToWorkout`, `useUpdateWorkoutMovementNotes`) were using `.select()` without specifying which fields to return, which resulted in only the base `workout_movements` table data being returned.

2. **No User Movement Data**: The UI components (`SortableMovementItem.tsx`, `MovementList.tsx`) display movement information using `movement.user_movement?.name || "Unknown Movement"`. Without the joined `user_movements` data, the name was undefined, triggering the fallback text.

3. **Inconsistent Select Statements**: The query (`useWorkoutMovements`) included a comprehensive `.select()` statement with all joined tables, but the mutations did not use the same select statement.

## Solution

### Updated Mutation Select Statements

Modified the following mutations in `/src/hooks/useMovements.ts` to include the full joined data:

- **`useAddMovementToWorkout`**: Now fetches complete movement data including user_movement, tracking_types, and muscle_groups
- **`useAddMovementsToWorkout`**: Now fetches complete movement data for batch inserts
- **`useUpdateWorkoutMovementNotes`**: Now fetches complete movement data when updating notes

Each mutation now uses the same comprehensive select statement:

```typescript
.select(
  `
  id,
  workout_id,
  user_movement_id,
  order_index,
  created_at,
  workout_notes,
  user_movements!inner(
    id,
    name,
    personal_notes,
    tags,
    experience_level,
    tracking_type_id,
    custom_rest_timer,
    last_used_at,
    manual_1rm,
    migrated_from_template,
    migration_date,
    original_template_id,
    template_id,
    user_id,
    created_at,
    updated_at,
    tracking_types!inner(name),
    user_movement_muscle_groups(
      muscle_groups(name, display_name)
    )
  )
`
)
```

## Impact

- ✅ Movements display their correct name immediately after being added
- ✅ No more "Unknown Movement" text appearing temporarily
- ✅ Improved user experience with immediate feedback
- ✅ Optimistic updates now show complete data
- ✅ Consistent data structure across queries and mutations

## Testing Recommendations

1. Navigate to a workout detail page
2. Add a new movement to the workout
3. Verify the movement name displays correctly immediately (not "Unknown Movement")
4. Verify all movement details (muscle groups, tracking type) are visible
5. Test batch adding multiple movements to ensure they all display correctly

## Related Files Modified

- `/src/hooks/useMovements.ts` - Updated select statements in `useAddMovementToWorkout`, `useAddMovementsToWorkout`, and `useUpdateWorkoutMovementNotes`
