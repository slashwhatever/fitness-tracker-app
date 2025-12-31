// Export refactored hooks with dependency injection
export type { HookDependencies } from "./src/hooks/types";
export * from "./src/hooks/useBackgroundSync";
export * from "./src/hooks/useHomeStats";
export * from "./src/hooks/useMovementLastSets";
export * from "./src/hooks/usePersonalRecords";
export * from "./src/hooks/useSets";
export * from "./src/hooks/useUserProfile";
export * from "./src/hooks/useWorkoutGroups";
export * from "./src/hooks/useWorkouts";

// Export utilities and types
export * from "./src/lib/auth";
export * from "./src/lib/rest-timer/RestTimerContext";
export * from "./src/lib/session-metrics";
export * from "./src/lib/utils/dateHelpers";
export * from "./src/models/types";
export * from "./src/types/database.types";
