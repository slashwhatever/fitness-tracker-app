import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import type {
  CreateUserMovementRequest,
  PersonalRecord,
  Set,
  UserMovement,
  Workout,
} from "@/models/types";

type Tables = Database["public"]["Tables"];

export class SupabaseService {
  private static getClient() {
    return createClient();
  }

  // ============================================================================
  // USER PROFILES
  // ============================================================================

  static async getUserProfile(
    userId: string
  ): Promise<Tables["user_profiles"]["Row"] | null> {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getUserProfile:", error);
      return null;
    }
  }

  static async saveUserProfile(
    profile: Tables["user_profiles"]["Insert"]
  ): Promise<Tables["user_profiles"]["Row"] | null> {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from("user_profiles")
        .upsert(profile)
        .select()
        .single();

      if (error) {
        console.error("Error saving user profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in saveUserProfile:", error);
      return null;
    }
  }

  // ============================================================================
  // WORKOUTS
  // ============================================================================

  static async getWorkouts(userId: string): Promise<Workout[]> {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from("workouts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching workouts:", error);
        return [];
      }

      return data as Workout[];
    } catch (error) {
      console.error("Error in getWorkouts:", error);
      return [];
    }
  }

  static async getWorkout(workoutId: string): Promise<Workout | null> {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from("workouts")
        .select("*")
        .eq("id", workoutId)
        .single();

      if (error) {
        console.error("Error fetching workout:", error);
        return null;
      }

      return data as Workout;
    } catch (error) {
      console.error("Error in getWorkout:", error);
      return null;
    }
  }

  static async saveWorkout(
    workout: Tables["workouts"]["Insert"]
  ): Promise<Workout | null> {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from("workouts")
        .insert(workout)
        .select()
        .single();

      if (error) {
        console.error("Error saving workout:", error);
        return null;
      }

      return data as Workout;
    } catch (error) {
      console.error("Error in saveWorkout:", error);
      return null;
    }
  }

  static async updateWorkout(
    workoutId: string,
    updates: Tables["workouts"]["Update"]
  ): Promise<Workout | null> {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from("workouts")
        .update(updates)
        .eq("id", workoutId)
        .select()
        .single();

      if (error) {
        console.error("Error updating workout:", error);
        return null;
      }

      return data as Workout;
    } catch (error) {
      console.error("Error in updateWorkout:", error);
      return null;
    }
  }

  static async deleteWorkout(workoutId: string): Promise<boolean> {
    try {
      const client = this.getClient();
      const { error } = await client
        .from("workouts")
        .delete()
        .eq("id", workoutId);

      if (error) {
        console.error("Error deleting workout:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteWorkout:", error);
      return false;
    }
  }

  // ============================================================================
  // USER MOVEMENTS
  // ============================================================================

  static async getUserMovements(userId: string): Promise<UserMovement[]> {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from("user_movements")
        .select("*")
        .eq("user_id", userId)
        .order("name");

      if (error) {
        console.error("Error fetching user movements:", error);
        return [];
      }

      return data as UserMovement[];
    } catch (error) {
      console.error("Error in getUserMovements:", error);
      return [];
    }
  }

  static async getUserMovement(
    movementId: string
  ): Promise<UserMovement | null> {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from("user_movements")
        .select("*")
        .eq("id", movementId)
        .single();

      if (error) {
        console.error("Error fetching user movement:", error);
        return null;
      }

      return data as UserMovement;
    } catch (error) {
      console.error("Error in getUserMovement:", error);
      return null;
    }
  }

  static async saveUserMovement(
    userId: string,
    movement: CreateUserMovementRequest
  ): Promise<UserMovement | null> {
    try {
      const client = this.getClient();

      // Add required fields
      const fullMovement = {
        id: crypto.randomUUID(),
        user_id: userId,
        ...movement,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await client
        .from("user_movements")
        .insert(fullMovement as Tables["user_movements"]["Insert"])
        .select()
        .single();

      if (error) {
        console.error("Error saving user movement:", error);
        return null;
      }

      return data as UserMovement;
    } catch (error) {
      console.error("Error in saveUserMovement:", error);
      return null;
    }
  }

  static async updateUserMovement(
    movementId: string,
    updates: Tables["user_movements"]["Update"]
  ): Promise<UserMovement | null> {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from("user_movements")
        .update(updates)
        .eq("id", movementId)
        .select()
        .single();

      if (error) {
        console.error("Error updating user movement:", error);
        return null;
      }

      return data as UserMovement;
    } catch (error) {
      console.error("Error in updateUserMovement:", error);
      return null;
    }
  }

  // ============================================================================
  // WORKOUT MOVEMENTS
  // ============================================================================

  static async getWorkoutMovements(
    workoutId: string
  ): Promise<Tables["workout_movements"]["Row"][]> {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from("workout_movements")
        .select("*")
        .eq("workout_id", workoutId)
        .order("order_index");

      if (error) {
        console.error("Error fetching workout movements:", error);
        return [];
      }

      return data;
    } catch (error) {
      console.error("Error in getWorkoutMovements:", error);
      return [];
    }
  }

  static async saveWorkoutMovement(
    workoutMovement: Tables["workout_movements"]["Insert"]
  ): Promise<Tables["workout_movements"]["Row"]> {
    const client = this.getClient();
    const { data, error } = await client
      .from("workout_movements")
      .insert(workoutMovement)
      .select()
      .single();

    if (error) {
      console.error("Error saving workout movement:", error);
      // Throw the actual Supabase error so retry logic can catch it
      throw error;
    }

    return data;
  }

  static async deleteWorkoutMovement(
    workoutMovementId: string
  ): Promise<boolean> {
    try {
      const client = this.getClient();
      const { error } = await client
        .from("workout_movements")
        .delete()
        .eq("id", workoutMovementId);

      if (error) {
        console.error("Error deleting workout movement:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteWorkoutMovement:", error);
      return false;
    }
  }

  // ============================================================================
  // SETS
  // ============================================================================

  static async getSets(userId: string): Promise<Set[]> {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from("sets")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching sets:", error);
        return [];
      }

      return data as Set[];
    } catch (error) {
      console.error("Error in getSets:", error);
      return [];
    }
  }

  static async getSetsByMovement(
    userId: string,
    userMovementId: string
  ): Promise<Set[]> {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from("sets")
        .select("*")
        .eq("user_id", userId)
        .eq("user_movement_id", userMovementId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching sets by movement:", error);
        return [];
      }

      return data as Set[];
    } catch (error) {
      console.error("Error in getSetsByMovement:", error);
      return [];
    }
  }

  static async saveSet(set: Tables["sets"]["Insert"]): Promise<Set | null> {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from("sets")
        .insert(set)
        .select()
        .single();

      if (error) {
        console.error("Error saving set:", error);
        return null;
      }

      return data as Set;
    } catch (error) {
      console.error("Error in saveSet:", error);
      return null;
    }
  }

  static async updateSet(
    setId: string,
    updates: Tables["sets"]["Update"]
  ): Promise<Set | null> {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from("sets")
        .update(updates)
        .eq("id", setId)
        .select()
        .single();

      if (error) {
        console.error("Error updating set:", error);
        return null;
      }

      return data as Set;
    } catch (error) {
      console.error("Error in updateSet:", error);
      return null;
    }
  }

  static async deleteSet(setId: string): Promise<boolean> {
    try {
      const client = this.getClient();
      const { error } = await client.from("sets").delete().eq("id", setId);

      if (error) {
        console.error("Error deleting set:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteSet:", error);
      return false;
    }
  }

  // ============================================================================
  // PERSONAL RECORDS
  // ============================================================================

  static async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from("personal_records")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching personal records:", error);
        return [];
      }

      return data as PersonalRecord[];
    } catch (error) {
      console.error("Error in getPersonalRecords:", error);
      return [];
    }
  }
}
