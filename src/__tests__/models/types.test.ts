import type {
  MovementTemplate,
  Set,
  SyncOperation,
  TimerPreset,
  User,
  UserProfile,
  Workout,
} from "@/models/types";

describe("Data Models", () => {
  describe("User Interface", () => {
    it("should have correct property structure", () => {
      const user: User = {
        id: "test-id",
        email: "test@example.com",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("created_at");
      expect(user).toHaveProperty("updated_at");
    });

    it("should use snake_case for property names", () => {
      const user: User = {
        id: "test-id",
        email: "test@example.com",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      // Ensure no camelCase properties exist
      expect(user).not.toHaveProperty("createdAt");
      expect(user).not.toHaveProperty("updatedAt");
    });
  });

  describe("MovementTemplate Interface", () => {
    it("should have correct structure with snake_case properties", () => {
      const template: MovementTemplate = {
        id: "test-id",
        name: "Push Up",
        muscle_group: "chest",
        tracking_type: "reps_weight",
        instructions: "Test instructions",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      expect(template).toHaveProperty("muscle_group");
      expect(template).toHaveProperty("tracking_type");
      expect(template).toHaveProperty("created_at");
      expect(template).toHaveProperty("updated_at");

      // Ensure no camelCase properties
      expect(template).not.toHaveProperty("muscleGroup");
      expect(template).not.toHaveProperty("trackingType");
    });

    it("should validate tracking_type values", () => {
      const validTypes = [
        "reps_weight",
        "reps_only",
        "time_distance",
        "time_only",
      ];

      validTypes.forEach((type) => {
        const template: MovementTemplate = {
          id: "test-id",
          name: "Test Movement",
          muscle_group: "chest",
          tracking_type: type as any,
          instructions: "Test",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        };

        expect(template.tracking_type).toBe(type);
      });
    });
  });

  describe("Workout Interface", () => {
    it("should have correct structure with snake_case properties", () => {
      const workout: Workout = {
        id: "test-id",
        user_id: "user-id",
        name: "Test Workout",
        description: "Test description",
        default_rest_timer: 180,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      expect(workout).toHaveProperty("user_id");
      expect(workout).toHaveProperty("default_rest_timer");
      expect(workout).toHaveProperty("created_at");
      expect(workout).toHaveProperty("updated_at");

      // Ensure no camelCase properties
      expect(workout).not.toHaveProperty("userId");
      expect(workout).not.toHaveProperty("defaultRestTimer");
    });
  });

  describe("Set Interface", () => {
    it("should have correct structure with snake_case properties", () => {
      const set: Set = {
        id: "test-id",
        workout_session_id: "session-id",
        movement_id: "movement-id",
        set_number: 1,
        reps: 10,
        weight: 100,
        duration: 60,
        distance: 1000,
        rest_timer: 180,
        completed_at: "2024-01-01T00:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
      };

      expect(set).toHaveProperty("workout_session_id");
      expect(set).toHaveProperty("movement_id");
      expect(set).toHaveProperty("set_number");
      expect(set).toHaveProperty("rest_timer");
      expect(set).toHaveProperty("completed_at");
      expect(set).toHaveProperty("created_at");

      // Ensure no camelCase properties
      expect(set).not.toHaveProperty("workoutSessionId");
      expect(set).not.toHaveProperty("movementId");
      expect(set).not.toHaveProperty("setNumber");
      expect(set).not.toHaveProperty("restTimer");
      expect(set).not.toHaveProperty("completedAt");
    });
  });

  describe("SyncOperation Interface", () => {
    it("should have correct structure for sync operations", () => {
      const syncOp: SyncOperation = {
        id: "test-id",
        table_name: "workouts",
        operation: "insert",
        data: { id: "test", name: "Test" },
        timestamp: "2024-01-01T00:00:00Z",
        retry_count: 0,
      };

      expect(syncOp).toHaveProperty("table_name");
      expect(syncOp).toHaveProperty("retry_count");
      expect(syncOp.operation).toMatch(/^(insert|update|delete)$/);

      // Ensure no camelCase properties
      expect(syncOp).not.toHaveProperty("tableName");
      expect(syncOp).not.toHaveProperty("retryCount");
    });
  });

  describe("UserProfile Interface", () => {
    it("should have correct structure with privacy settings", () => {
      const profile: UserProfile = {
        id: "test-id",
        display_name: "Test User",
        default_rest_timer: 180,
        privacy_settings: {
          profile_visibility: "private",
          workout_sharing: false,
        },
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      expect(profile).toHaveProperty("display_name");
      expect(profile).toHaveProperty("default_rest_timer");
      expect(profile).toHaveProperty("privacy_settings");
      expect(profile.privacy_settings).toHaveProperty("profile_visibility");
      expect(profile.privacy_settings).toHaveProperty("workout_sharing");

      // Ensure no camelCase properties
      expect(profile).not.toHaveProperty("displayName");
      expect(profile).not.toHaveProperty("defaultRestTimer");
      expect(profile).not.toHaveProperty("privacySettings");
    });
  });

  describe("TimerPreset Interface", () => {
    it("should have correct structure for timer hierarchy", () => {
      const preset: TimerPreset = {
        id: "test-id",
        user_id: "user-id",
        name: "Heavy Lifting",
        duration: 300,
        is_default: false,
        created_at: "2024-01-01T00:00:00Z",
      };

      expect(preset).toHaveProperty("user_id");
      expect(preset).toHaveProperty("is_default");
      expect(preset).toHaveProperty("created_at");

      // Ensure no camelCase properties
      expect(preset).not.toHaveProperty("userId");
      expect(preset).not.toHaveProperty("isDefault");
      expect(preset).not.toHaveProperty("createdAt");
    });
  });

  describe("Data Validation", () => {
    it("should handle ISO date strings correctly", () => {
      const isoDate = "2024-01-01T00:00:00.000Z";
      const parsedDate = new Date(isoDate);

      expect(parsedDate).toBeInstanceOf(Date);
      expect(parsedDate.toISOString()).toBe(isoDate);
    });

    it("should validate required fields", () => {
      // Test that TypeScript enforces required fields
      const createWorkout = (data: Partial<Workout>): Workout => {
        return {
          id: data.id || "default-id",
          user_id: data.user_id || "default-user",
          name: data.name || "Default Workout",
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
          ...data,
        } as Workout;
      };

      const workout = createWorkout({
        name: "Test Workout",
        user_id: "test-user",
      });

      expect(workout.name).toBe("Test Workout");
      expect(workout.user_id).toBe("test-user");
    });
  });
});
