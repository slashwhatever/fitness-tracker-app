import { createContext, useContext } from "react";

export interface RestTimerState {
  isActive: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  startTime: number | null; // Timestamp when timer started
  duration: number; // Total duration in seconds
  remainingTime: number; // Current remaining time in seconds
  pausedAt: number | null; // Timestamp when paused
  movementId: string | null;
  workoutId: string | null;
}

export interface RestTimerContextType extends RestTimerState {
  startTimer: (
    duration: number,
    metadata?: { movementId?: string; workoutId?: string }
  ) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void; // Resets to initial duration
  cancelTimer: () => void; // Stops and clears
  addTime: (seconds: number) => void;
}

export const RestTimerContext = createContext<RestTimerContextType | undefined>(
  undefined
);

export function useRestTimer() {
  const context = useContext(RestTimerContext);
  if (context === undefined) {
    throw new Error("useRestTimer must be used within a RestTimerProvider");
  }
  return context;
}
