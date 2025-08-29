// Core TypeScript interfaces for the Fitness Tracking App
// Based on architecture specifications from docs/architecture/data-models.md

export interface User {
  id: string;
  createdAt: Date;
}

export interface MovementTemplate {
  id: string;
  name: string;
  muscleGroup: string;
  trackingType: "weight" | "bodyweight" | "timed";
  experienceLevel: "Beginner" | "Intermediate" | "Advanced";
}

export interface UserMovement {
  id: string;
  userId: string;
  templateId: string | null; // Null indicates a fully custom movement
  name: string; // User-defined if custom, otherwise copied from template
  muscleGroup?: string; // Only required if custom
  trackingType?: "weight" | "bodyweight" | "timed"; // Only required if custom
  personalNotes?: string;
  manual1RM?: number;
  customRestTimer?: number;
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  userMovements: UserMovement[];
  createdAt: Date;
}

export interface Set {
  id: string;
  userMovementId: string;
  reps?: number;
  weight?: number;
  duration?: number;
  createdAt: Date;
}
