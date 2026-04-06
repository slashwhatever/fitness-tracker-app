"use client";

import { useTimer } from "@/contexts/TimerContext";
import { RestTimerContext } from "@fitness/shared";
import { useCallback } from "react";

export function RestTimerProvider({ children }: { children: React.ReactNode }) {
  const {
    isActive,
    isPaused,
    isComplete,
    duration,
    timeLeft,
    startTimer: startWebTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    stopTimer,
  } = useTimer();

  // Bridge the startTimer function
  const startTimer = useCallback(
    (
      duration: number,
      _metadata?: { movementId?: string; workoutId?: string }
    ) => {
      // For now, we ignore metadata in the web app as the web timer is global
      // TODO: Enhance web timer to support metadata tracking if needed
      startWebTimer(duration);
    },
    [startWebTimer]
  );

  const cancelTimer = useCallback(() => {
    stopTimer();
  }, [stopTimer]);

  const addTime = useCallback((_seconds: number) => {
    // addTime is not supported by the web timer adapter — no-op.
    // TODO: implement addTime support in the web TimerContext if needed.
  }, []);

  return (
    <RestTimerContext.Provider
      value={{
        isActive,
        isPaused,
        isCompleted: isComplete,
        startTime: null, // precise start time not exposed by web timer context currently
        duration,
        remainingTime: timeLeft,
        pausedAt: null, // precise paused time not exposed
        movementId: null, // metadata not tracked in web timer context
        workoutId: null, // metadata not tracked in web timer context
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        cancelTimer,
        addTime,
      }}
    >
      {children}
    </RestTimerContext.Provider>
  );
}
