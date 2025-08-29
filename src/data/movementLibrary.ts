import { MovementTemplate } from "@/models/types";

export const movementLibrary: MovementTemplate[] = [
  // Chest Exercises
  {
    id: "bench-press",
    name: "Bench Press",
    muscleGroup: "Chest",
    trackingType: "weight",
    experienceLevel: "Intermediate",
  },
  {
    id: "push-ups",
    name: "Push-ups",
    muscleGroup: "Chest",
    trackingType: "bodyweight",
    experienceLevel: "Beginner",
  },
  {
    id: "incline-bench-press",
    name: "Incline Bench Press",
    muscleGroup: "Chest",
    trackingType: "weight",
    experienceLevel: "Intermediate",
  },
  {
    id: "decline-bench-press",
    name: "Decline Bench Press",
    muscleGroup: "Chest",
    trackingType: "weight",
    experienceLevel: "Advanced",
  },
  {
    id: "dumbbell-flyes",
    name: "Dumbbell Flyes",
    muscleGroup: "Chest",
    trackingType: "weight",
    experienceLevel: "Intermediate",
  },

  // Back Exercises
  {
    id: "pull-ups",
    name: "Pull-ups",
    muscleGroup: "Back",
    trackingType: "bodyweight",
    experienceLevel: "Intermediate",
  },
  {
    id: "deadlift",
    name: "Deadlift",
    muscleGroup: "Back",
    trackingType: "weight",
    experienceLevel: "Advanced",
  },
  {
    id: "barbell-rows",
    name: "Barbell Rows",
    muscleGroup: "Back",
    trackingType: "weight",
    experienceLevel: "Intermediate",
  },
  {
    id: "lat-pulldowns",
    name: "Lat Pulldowns",
    muscleGroup: "Back",
    trackingType: "weight",
    experienceLevel: "Beginner",
  },
  {
    id: "face-pulls",
    name: "Face Pulls",
    muscleGroup: "Back",
    trackingType: "weight",
    experienceLevel: "Beginner",
  },

  // Shoulder Exercises
  {
    id: "overhead-press",
    name: "Overhead Press",
    muscleGroup: "Shoulders",
    trackingType: "weight",
    experienceLevel: "Intermediate",
  },
  {
    id: "lateral-raises",
    name: "Lateral Raises",
    muscleGroup: "Shoulders",
    trackingType: "weight",
    experienceLevel: "Beginner",
  },
  {
    id: "front-raises",
    name: "Front Raises",
    muscleGroup: "Shoulders",
    trackingType: "weight",
    experienceLevel: "Beginner",
  },
  {
    id: "rear-delt-flyes",
    name: "Rear Delt Flyes",
    muscleGroup: "Shoulders",
    trackingType: "weight",
    experienceLevel: "Beginner",
  },

  // Bicep Exercises
  {
    id: "barbell-curls",
    name: "Barbell Curls",
    muscleGroup: "Biceps",
    trackingType: "weight",
    experienceLevel: "Beginner",
  },
  {
    id: "dumbbell-curls",
    name: "Dumbbell Curls",
    muscleGroup: "Biceps",
    trackingType: "weight",
    experienceLevel: "Beginner",
  },
  {
    id: "hammer-curls",
    name: "Hammer Curls",
    muscleGroup: "Biceps",
    trackingType: "weight",
    experienceLevel: "Beginner",
  },
  {
    id: "preacher-curls",
    name: "Preacher Curls",
    muscleGroup: "Biceps",
    trackingType: "weight",
    experienceLevel: "Intermediate",
  },

  // Tricep Exercises
  {
    id: "tricep-dips",
    name: "Tricep Dips",
    muscleGroup: "Triceps",
    trackingType: "bodyweight",
    experienceLevel: "Intermediate",
  },
  {
    id: "skull-crushers",
    name: "Skull Crushers",
    muscleGroup: "Triceps",
    trackingType: "weight",
    experienceLevel: "Intermediate",
  },
  {
    id: "tricep-pushdowns",
    name: "Tricep Pushdowns",
    muscleGroup: "Triceps",
    trackingType: "weight",
    experienceLevel: "Beginner",
  },

  // Leg Exercises
  {
    id: "squats",
    name: "Squats",
    muscleGroup: "Legs",
    trackingType: "weight",
    experienceLevel: "Intermediate",
  },
  {
    id: "leg-press",
    name: "Leg Press",
    muscleGroup: "Legs",
    trackingType: "weight",
    experienceLevel: "Beginner",
  },
  {
    id: "lunges",
    name: "Lunges",
    muscleGroup: "Legs",
    trackingType: "weight",
    experienceLevel: "Beginner",
  },
  {
    id: "leg-curls",
    name: "Leg Curls",
    muscleGroup: "Legs",
    trackingType: "weight",
    experienceLevel: "Beginner",
  },
  {
    id: "leg-extensions",
    name: "Leg Extensions",
    muscleGroup: "Legs",
    trackingType: "weight",
    experienceLevel: "Beginner",
  },
  {
    id: "calf-raises",
    name: "Calf Raises",
    muscleGroup: "Legs",
    trackingType: "weight",
    experienceLevel: "Beginner",
  },

  // Core Exercises
  {
    id: "plank",
    name: "Plank",
    muscleGroup: "Core",
    trackingType: "timed",
    experienceLevel: "Beginner",
  },
  {
    id: "crunches",
    name: "Crunches",
    muscleGroup: "Core",
    trackingType: "bodyweight",
    experienceLevel: "Beginner",
  },
  {
    id: "russian-twists",
    name: "Russian Twists",
    muscleGroup: "Core",
    trackingType: "bodyweight",
    experienceLevel: "Intermediate",
  },
  {
    id: "leg-raises",
    name: "Leg Raises",
    muscleGroup: "Core",
    trackingType: "bodyweight",
    experienceLevel: "Intermediate",
  },

  // Cardio Exercises
  {
    id: "running",
    name: "Running",
    muscleGroup: "Cardio",
    trackingType: "timed",
    experienceLevel: "Beginner",
  },
  {
    id: "cycling",
    name: "Cycling",
    muscleGroup: "Cardio",
    trackingType: "timed",
    experienceLevel: "Beginner",
  },
  {
    id: "rowing",
    name: "Rowing",
    muscleGroup: "Cardio",
    trackingType: "timed",
    experienceLevel: "Intermediate",
  },
  {
    id: "jump-rope",
    name: "Jump Rope",
    muscleGroup: "Cardio",
    trackingType: "timed",
    experienceLevel: "Beginner",
  },
];

export const muscleGroups = Array.from(
  new Set(movementLibrary.map((m) => m.muscleGroup))
).sort();
export const experienceLevels = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;
export const trackingTypes = ["weight", "bodyweight", "timed"] as const;
