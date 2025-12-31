import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";

interface RestTimerState {
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

const RestTimerContext = createContext<RestTimerContextType | undefined>(
  undefined
);

export function RestTimerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RestTimerState>({
    isActive: false,
    isPaused: false,
    isCompleted: false,
    startTime: null,
    duration: 0,
    remainingTime: 0,
    pausedAt: null,
    movementId: null,
    workoutId: null,
  });

  const intervalRef = useRef<any>(null);
  const appState = useRef(AppState.currentState);

  // Helper to clear interval safely
  const clearIntervalSafe = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const cancelTimer = useCallback(() => {
    clearIntervalSafe();
    setState({
      isActive: false,
      isPaused: false,
      isCompleted: false,
      startTime: null,
      duration: 0,
      remainingTime: 0,
      pausedAt: null,
      movementId: null,
      workoutId: null,
    });
  }, []);

  const tick = useCallback(() => {
    setState((prev) => {
      if (!prev.isActive || prev.isPaused || !prev.startTime) return prev;

      const now = Date.now();
      const elapsed = Math.floor((now - prev.startTime) / 1000);
      const newRemaining = prev.duration - elapsed;

      if (newRemaining <= 0) {
        clearIntervalSafe();

        // Auto-hide after 5 seconds
        setTimeout(() => {
          setState((current) => ({
            ...current,
            isCompleted: false,
            isActive: false,
          }));
        }, 5000);

        return {
          ...prev,
          remainingTime: 0,
          isActive: false,
          isCompleted: true,
        };
      }

      return { ...prev, remainingTime: newRemaining };
    });
  }, []);

  const startTimer = useCallback(
    (
      duration: number,
      metadata?: { movementId?: string; workoutId?: string }
    ) => {
      // Prevent rapid restarts for the same movement (e.g. from rapid mutations or optimistic flukes)
      // Check if we already have an active timer for this movement started recently (< 2s)
      if (
        state.isActive &&
        state.movementId === metadata?.movementId &&
        state.startTime &&
        Date.now() - state.startTime < 2000
      ) {
        return;
      }

      clearIntervalSafe();
      setState({
        isActive: true,
        isPaused: false,
        isCompleted: false,
        startTime: Date.now(),
        duration,
        remainingTime: duration,
        pausedAt: null,
        movementId: metadata?.movementId ?? null,
        workoutId: metadata?.workoutId ?? null,
      });

      intervalRef.current = setInterval(tick, 1000);
    },
    [tick, state.isActive, state.movementId, state.startTime]
  );

  const pauseTimer = useCallback(() => {
    if (!state.isActive || state.isPaused) return;
    clearIntervalSafe();
    setState((prev) => ({
      ...prev,
      isPaused: true,
      pausedAt: Date.now(),
    }));
  }, [state.isActive, state.isPaused]);

  const resumeTimer = useCallback(() => {
    if (!state.isActive || !state.isPaused) return;

    setState((prev) => ({
      ...prev,
      isPaused: false,
      pausedAt: null,
    }));

    intervalRef.current = setInterval(tick, 1000);
  }, [state.isActive, state.isPaused, tick]);

  const resetTimer = useCallback(() => {
    if (!state.isActive) return;
    clearIntervalSafe();
    setState((prev) => ({
      ...prev,
      isPaused: false,
      remainingTime: prev.duration,
      startTime: Date.now(),
      pausedAt: null,
    }));
    intervalRef.current = setInterval(tick, 1000);
  }, [state.isActive, tick]);

  const addTime = useCallback((seconds: number) => {
    setState((prev) => {
      if (!prev.isActive) return prev;
      return {
        ...prev,
        duration: prev.duration + seconds,
        remainingTime: prev.remainingTime + seconds,
      };
    });
  }, []);

  // Keep stateRef updated for the event listener
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Handle App State Changes (Background/Foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      const currentState = stateRef.current;
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App came to foreground
        // Restart interval if needed
        if (
          currentState.isActive &&
          !currentState.isPaused &&
          !intervalRef.current
        ) {
          intervalRef.current = setInterval(tick, 1000);
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App went to background
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      clearIntervalSafe();
    };
  }, []); // Empty dependency ensures cleanup only runs on unmount

  return (
    <RestTimerContext.Provider
      value={{
        ...state,
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

export function useRestTimer() {
  const context = useContext(RestTimerContext);
  if (context === undefined) {
    throw new Error("useRestTimer must be used within a RestTimerProvider");
  }
  return context;
}
