import { Set } from "@/models/types";
import { getUserWeightUnit } from "./userPreferences";

/**
 * Calculate estimated 1 Rep Max using the Brzycki formula
 * Formula: 1RM = Weight × (36 / (37 - Reps))
 * Valid for reps between 1-36
 */
export function calculateOneRepMax(
  weight: number,
  reps: number
): number | null {
  // Validate inputs
  if (!weight || !reps || weight <= 0 || reps <= 0) {
    return null;
  }

  // Brzycki formula is only valid for reps 1-36
  if (reps > 36) {
    return null;
  }

  // If reps = 1, the weight is already the 1RM
  if (reps === 1) {
    return weight;
  }

  // Brzycki formula
  const oneRM = weight * (36 / (37 - reps));

  // Round to nearest 0.5 for practical purposes
  return Math.round(oneRM * 2) / 2;
}

/**
 * Find the best estimated 1RM from a collection of sets
 * Returns the highest calculated 1RM, not necessarily from the heaviest weight
 */
export function getBest1RM(
  sets: Set[]
): { oneRM: number; fromSet: Set } | null {
  if (!sets || sets.length === 0) {
    return null;
  }

  let best1RM = 0;
  let bestSet: Set | null = null;

  for (const set of sets) {
    if (set.weight && set.reps) {
      const estimated1RM = calculateOneRepMax(set.weight, set.reps);

      if (estimated1RM && estimated1RM > best1RM) {
        best1RM = estimated1RM;
        bestSet = set;
      }
    }
  }

  if (bestSet && best1RM > 0) {
    return {
      oneRM: best1RM,
      fromSet: bestSet,
    };
  }

  return null;
}

/**
 * Format 1RM for display with appropriate precision (sync version with default unit)
 */
export function format1RM(oneRM: number): string {
  if (oneRM % 1 === 0) {
    return `${oneRM} lbs`;
  }
  return `${oneRM.toFixed(1)} lbs`;
}

/**
 * Format 1RM for display with user's preferred unit (async version)
 */
export async function format1RMWithUnit(oneRM: number): Promise<string> {
  const unit = await getUserWeightUnit();
  if (oneRM % 1 === 0) {
    return `${oneRM} ${unit}`;
  }
  return `${oneRM.toFixed(1)} ${unit}`;
}

/**
 * Alternative 1RM formulas for comparison (not currently used)
 */
export const alternativeFormulas = {
  // Epley formula: 1RM = Weight × (1 + Reps/30)
  epley: (weight: number, reps: number): number | null => {
    if (!weight || !reps || weight <= 0 || reps <= 0 || reps > 15) {
      return null;
    }
    return weight * (1 + reps / 30);
  },

  // Lombardi formula: 1RM = Weight × Reps^0.10
  lombardi: (weight: number, reps: number): number | null => {
    if (!weight || !reps || weight <= 0 || reps <= 0 || reps > 20) {
      return null;
    }
    return weight * Math.pow(reps, 0.1);
  },
};
