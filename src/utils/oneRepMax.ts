import { Set } from "@/models/types";
import { UserPreferences } from "./userPreferences";

/**
 * Calculate estimated 1 Rep Max using the Brzycki formula
 * 1RM = weight / (1.0278 - (0.0278 × reps))
 */
export function calculate1RM(weight: number, reps: number): number {
  if (reps <= 1) return weight;
  return weight / (1.0278 - 0.0278 * reps);
}

/**
 * Format 1RM for display with proper weight unit
 */
export async function format1RM(
  oneRM: number,
  userId: string
): Promise<string> {
  const unit = await UserPreferences.getWeightUnit(userId);
  return `${Math.round(oneRM)} ${unit}`;
}

/**
 * Get the best 1RM from a collection of sets
 */
export function getBest1RM(
  sets: Set[]
): { oneRM: number; fromSet: Set } | null {
  const validSets = sets.filter(
    (set) => set.weight && set.reps && set.reps > 0
  );
  if (validSets.length === 0) return null;

  let bestOneRM = 0;
  let bestSet: Set | null = null;

  for (const set of validSets) {
    const oneRM = calculate1RM(set.weight!, set.reps!);
    if (oneRM > bestOneRM) {
      bestOneRM = oneRM;
      bestSet = set;
    }
  }

  return bestSet ? { oneRM: bestOneRM, fromSet: bestSet } : null;
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
