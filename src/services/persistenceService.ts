// Local Storage Persistence Service
// Provides type-safe wrapper for localStorage with error handling

import {
  Set,
  User,
  UserMovement,
  Workout,
  WorkoutMovement,
} from "@/models/types";

export class PersistenceService {
  private static instance: PersistenceService;

  private constructor() {}

  public static getInstance(): PersistenceService {
    if (!PersistenceService.instance) {
      PersistenceService.instance = new PersistenceService();
    }
    return PersistenceService.instance;
  }

  // Generic save function with error handling
  private saveToStorage<T>(key: string, data: T): boolean {
    try {
      if (typeof window === "undefined") {
        console.warn("localStorage not available in server environment");
        return false;
      }
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(
        `Failed to save data to localStorage for key "${key}":`,
        error
      );
      return false;
    }
  }

  // Generic retrieve function with error handling
  private getFromStorage<T>(key: string): T | null {
    try {
      if (typeof window === "undefined") {
        console.warn("localStorage not available in server environment");
        return null;
      }
      const item = localStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(
        `Failed to retrieve data from localStorage for key "${key}":`,
        error
      );
      return null;
    }
  }

  // User data persistence
  public saveUser(user: User): boolean {
    return this.saveToStorage("user", user);
  }

  public getUser(): User | null {
    return this.getFromStorage<User>("user");
  }

  // Workout data persistence
  public saveWorkouts(workouts: Workout[]): boolean {
    return this.saveToStorage("workouts", workouts);
  }

  public getWorkouts(): Workout[] {
    return this.getFromStorage<Workout[]>("workouts") || [];
  }

  public saveWorkout(workout: Workout): boolean {
    const workouts = this.getWorkouts();
    const existingIndex = workouts.findIndex((w) => w.id === workout.id);

    if (existingIndex >= 0) {
      workouts[existingIndex] = workout;
    } else {
      workouts.push(workout);
    }

    return this.saveWorkouts(workouts);
  }

  public deleteWorkout(workoutId: string): boolean {
    const workouts = this.getWorkouts();
    const filteredWorkouts = workouts.filter((w) => w.id !== workoutId);
    return this.saveWorkouts(filteredWorkouts);
  }

  // User Movement data persistence
  public saveUserMovements(userMovements: UserMovement[]): boolean {
    return this.saveToStorage("userMovements", userMovements);
  }

  public getUserMovements(): UserMovement[] {
    return this.getFromStorage<UserMovement[]>("userMovements") || [];
  }

  public saveUserMovement(userMovement: UserMovement): boolean {
    const userMovements = this.getUserMovements();
    const existingIndex = userMovements.findIndex(
      (um) => um.id === userMovement.id
    );

    if (existingIndex >= 0) {
      userMovements[existingIndex] = userMovement;
    } else {
      userMovements.push(userMovement);
    }

    return this.saveUserMovements(userMovements);
  }

  public deleteUserMovement(user_movement_id: string): boolean {
    const userMovements = this.getUserMovements();
    const filteredUserMovements = userMovements.filter(
      (um) => um.id !== user_movement_id
    );
    return this.saveUserMovements(filteredUserMovements);
  }

  // Set data persistence
  public saveSets(sets: Set[]): boolean {
    return this.saveToStorage("sets", sets);
  }

  public getSets(): Set[] {
    return this.getFromStorage<Set[]>("sets") || [];
  }

  public saveSet(set: Set): boolean {
    const sets = this.getSets();
    const existingIndex = sets.findIndex((s) => s.id === set.id);

    if (existingIndex >= 0) {
      sets[existingIndex] = set;
    } else {
      sets.push(set);
    }

    return this.saveSets(sets);
  }

  public deleteSet(setId: string): boolean {
    const sets = this.getSets();
    const filteredSets = sets.filter((s) => s.id !== setId);
    return this.saveSets(filteredSets);
  }

  // Get sets for a specific user movement
  public getSetsForUserMovement(user_movement_id: string): Set[] {
    const sets = this.getSets();
    return sets.filter((s) => s.user_movement_id === user_movement_id);
  }

  // Clear all data (useful for testing or reset)
  public clearAllData(): boolean {
    try {
      if (typeof window === "undefined") {
        return false;
      }
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
      return false;
    }
  }

  // WorkoutMovement management
  public saveWorkoutMovement(workoutMovement: WorkoutMovement): boolean {
    try {
      const workoutMovements = this.getWorkoutMovements();
      const existingIndex = workoutMovements.findIndex(
        (wm) => wm.id === workoutMovement.id
      );

      if (existingIndex >= 0) {
        workoutMovements[existingIndex] = workoutMovement;
      } else {
        workoutMovements.push(workoutMovement);
      }

      localStorage.setItem(
        "workout_movements",
        JSON.stringify(workoutMovements)
      );
      return true;
    } catch (error) {
      console.error("Failed to save workout movement:", error);
      return false;
    }
  }

  public getWorkoutMovements(): WorkoutMovement[] {
    try {
      const data = localStorage.getItem("workout_movements");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to get workout movements:", error);
      return [];
    }
  }

  public deleteWorkoutMovement(workoutMovementId: string): boolean {
    try {
      const workoutMovements = this.getWorkoutMovements();
      const filtered = workoutMovements.filter(
        (wm) => wm.id !== workoutMovementId
      );
      localStorage.setItem("workout_movements", JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error("Failed to delete workout movement:", error);
      return false;
    }
  }

  public getMovementsForWorkout(workoutId: string): UserMovement[] {
    try {
      const workoutMovements = this.getWorkoutMovements()
        .filter((wm) => wm.workout_id === workoutId)
        .sort((a, b) => a.order_index - b.order_index);

      const userMovements = this.getUserMovements();

      return workoutMovements
        .map((wm) => userMovements.find((um) => um.id === wm.user_movement_id))
        .filter((movement): movement is UserMovement => movement !== undefined);
    } catch (error) {
      console.error("Failed to get movements for workout:", error);
      return [];
    }
  }

  public addMovementsToWorkout(
    workoutId: string,
    movements: UserMovement[]
  ): boolean {
    try {
      const existingWorkoutMovements = this.getWorkoutMovements().filter(
        (wm) => wm.workout_id === workoutId
      );
      const maxOrderIndex =
        existingWorkoutMovements.length > 0
          ? Math.max(...existingWorkoutMovements.map((wm) => wm.order_index))
          : -1;

      // Save the user movements first
      movements.forEach((movement) => {
        this.saveUserMovement(movement);
      });

      // Create WorkoutMovement relationships
      movements.forEach((movement, index) => {
        const workoutMovement: WorkoutMovement = {
          id: crypto.randomUUID(),
          workout_id: workoutId,
          user_movement_id: movement.id,
          order_index: maxOrderIndex + 1 + index,
          created_at: new Date().toISOString(),
        };
        this.saveWorkoutMovement(workoutMovement);
      });

      return true;
    } catch (error) {
      console.error("Failed to add movements to workout:", error);
      return false;
    }
  }

  public removeMovementFromWorkout(
    workoutId: string,
    userMovementId: string
  ): boolean {
    try {
      const workoutMovements = this.getWorkoutMovements();
      const workoutMovement = workoutMovements.find(
        (wm) =>
          wm.workout_id === workoutId && wm.user_movement_id === userMovementId
      );

      if (workoutMovement) {
        this.deleteWorkoutMovement(workoutMovement.id);
      }

      return true;
    } catch (error) {
      console.error("Failed to remove movement from workout:", error);
      return false;
    }
  }

  // Temporary method to get movement count for a workout
  public getMovementCountForWorkout(workoutId: string): number {
    return this.getMovementsForWorkout(workoutId).length;
  }
}

// Export singleton instance
export const persistenceService = PersistenceService.getInstance();
