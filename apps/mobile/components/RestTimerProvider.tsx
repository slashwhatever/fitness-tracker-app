import { RestTimerContext, RestTimerState } from "@fitness/shared";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import {
  cancelTimerNotification,
  completeTimerNotification,
  pauseTimerNotification,
  setupNotificationChannel,
  startTimerNotification,
  updateTimerNotification,
} from "../services/notificationService";

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
  const autoHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appState = useRef(AppState.currentState);

  // Helper to clear interval safely
  const clearIntervalSafe = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Helper to clear auto-hide timeout safely
  const clearAutoHideTimeout = () => {
    if (autoHideTimeoutRef.current) {
      clearTimeout(autoHideTimeoutRef.current);
      autoHideTimeoutRef.current = null;
    }
  };

  const cancelTimer = useCallback(() => {
    clearIntervalSafe();
    cancelTimerNotification();
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
        completeTimerNotification();

        // Auto-hide after 5 seconds
        autoHideTimeoutRef.current = setTimeout(() => {
          autoHideTimeoutRef.current = null;
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

      // Update notification with new remaining time
      updateTimerNotification(prev.duration, newRemaining);
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
      // Cancel any pending auto-hide timeout from a previous timer
      clearAutoHideTimeout();
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

      // Start the notification with the timer
      startTimerNotification(duration, duration);
      intervalRef.current = setInterval(tick, 1000);
    },
    [tick, state.isActive, state.movementId, state.startTime]
  );

  const pauseTimer = useCallback(() => {
    if (!state.isActive || state.isPaused) return;
    clearIntervalSafe();
    pauseTimerNotification(state.remainingTime);
    setState((prev) => ({
      ...prev,
      isPaused: true,
      pausedAt: Date.now(),
    }));
  }, [state.isActive, state.isPaused, state.remainingTime]);

  const resumeTimer = useCallback(() => {
    if (!state.isActive || !state.isPaused) return;

    // Resume notification updates
    startTimerNotification(state.duration, state.remainingTime);
    setState((prev) => ({
      ...prev,
      isPaused: false,
      pausedAt: null,
    }));

    intervalRef.current = setInterval(tick, 1000);
  }, [
    state.isActive,
    state.isPaused,
    state.duration,
    state.remainingTime,
    tick,
  ]);

  const resetTimer = useCallback(() => {
    if (!state.isActive) return;
    clearIntervalSafe();
    // Reset notification to full duration
    startTimerNotification(state.duration, state.duration);
    setState((prev) => ({
      ...prev,
      isPaused: false,
      remainingTime: prev.duration,
      startTime: Date.now(),
      pausedAt: null,
    }));
    intervalRef.current = setInterval(tick, 1000);
  }, [state.isActive, state.duration, tick]);

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

  // Setup notification channel on mount
  useEffect(() => {
    setupNotificationChannel();
  }, []);

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
        // App went to background (interval naturally pauses/stops or might keep running depending on OS, but we re-sync on foreground)
        // Ideally we should clear interval here to save resources and rely on timestamp diff on resume
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      clearIntervalSafe();
    };
  }, [tick]);

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
