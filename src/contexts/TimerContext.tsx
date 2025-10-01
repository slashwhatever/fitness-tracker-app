"use client";

import { useUserProfile } from "@/hooks/useUserProfile";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface TimerContextType {
  isActive: boolean;
  timeLeft: number;
  duration: number;
  isPaused: boolean;
  isComplete: boolean;
  isWarning: boolean;
  progressPercentage: number;
  isPinned: boolean;
  startTimer: (duration?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  stopTimer: () => void;
  formatTime: (seconds: number) => string;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

interface TimerProviderProps {
  children: ReactNode;
}

export function TimerProvider({ children }: TimerProviderProps) {
  const { data: userProfile } = useUserProfile();
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasNotified, setHasNotified] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const lastSaveTimeRef = useRef<number>(Date.now());

  // Track pin state from user profile
  const isPinned = userProfile?.timer_pin_enabled ?? true;

  // Storage keys
  const TIMER_STORAGE_KEY = "logset_timer_state";

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Load timer state from localStorage on mount (only after hydration)
  useEffect(() => {
    if (!isHydrated) return;

    try {
      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        const now = Date.now();
        const elapsed = Math.floor((now - state.timestamp) / 1000);

        // Only restore if the timer was active and not too old (max 24 hours)
        if (state.isActive && elapsed < 86400) {
          const newTimeLeft = Math.max(0, state.timeLeft - elapsed);

          setIsActive(true);
          setDuration(state.duration);
          setTimeLeft(newTimeLeft);
          setIsPaused(state.isPaused);
          setHasNotified(newTimeLeft <= 0 ? true : state.hasNotified);
          lastSaveTimeRef.current = now;
        }
      }
    } catch (error) {
      console.warn("Failed to restore timer state:", error);
    }
  }, [isHydrated]);

  // Save timer state to localStorage
  const saveTimerState = useCallback(() => {
    if (!isHydrated) return;

    try {
      const state = {
        isActive,
        timeLeft,
        duration,
        isPaused,
        hasNotified,
        timestamp: Date.now(),
      };

      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
      lastSaveTimeRef.current = Date.now();
    } catch (error) {
      console.warn("Failed to save timer state:", error);
    }
  }, [isActive, timeLeft, duration, isPaused, hasNotified, isHydrated]);

  // Clear timer state from localStorage
  const clearTimerState = useCallback(() => {
    if (!isHydrated) return;

    try {
      localStorage.removeItem(TIMER_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear timer state:", error);
    }
  }, [isHydrated]);

  // Save state periodically when timer is active
  useEffect(() => {
    if (!isActive) {
      clearTimerState();
      return;
    }

    // Save every 5 seconds when active
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastSaveTimeRef.current >= 5000) {
        saveTimerState();
      }
    }, 5000);

    // Save immediately when state changes
    saveTimerState();

    return () => clearInterval(interval);
  }, [
    isActive,
    isHydrated,
    timeLeft,
    isPaused,
    saveTimerState,
    clearTimerState,
  ]);

  // Get default duration from user profile with fallback hierarchy
  const getDefaultDuration = useCallback(() => {
    if (userProfile?.default_rest_timer) return userProfile.default_rest_timer;
    return 120; // 2 minutes default
  }, [userProfile?.default_rest_timer]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  const showNotification = useCallback(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Rest Complete!", {
        body: "Time for your next set",
        icon: "/favicon.ico",
      });
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      // Audio notification not available - silent fallback
    }
  }, []);

  const startTimer = useCallback(
    (customDuration?: number) => {
      const timerDuration = customDuration || getDefaultDuration();
      setDuration(timerDuration);
      setTimeLeft(timerDuration);
      setIsActive(true);
      setIsPaused(false);
      setHasNotified(false);
      requestNotificationPermission();
    },
    [getDefaultDuration, requestNotificationPermission]
  );

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);

  const resetTimer = useCallback(() => {
    setTimeLeft(duration);
    setIsPaused(false);
    setHasNotified(false);
  }, [duration]);

  const skipTimer = useCallback(() => {
    setTimeLeft(0);
    setIsActive(false);
    setIsPaused(false);
    setHasNotified(false);
    clearTimerState();
  }, [clearTimerState]);

  const stopTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(0);
    setIsPaused(false);
    setHasNotified(false);
    clearTimerState();
  }, [clearTimerState]);

  // Timer countdown effect
  useEffect(() => {
    if (!isActive || isPaused) return;

    if (timeLeft <= 0) {
      if (!hasNotified) {
        showNotification();
        playNotificationSound();
        setHasNotified(true);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    isActive,
    timeLeft,
    isPaused,
    hasNotified,
    showNotification,
    playNotificationSound,
  ]);

  const progressPercentage =
    duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;
  const isComplete = timeLeft <= 0 && isActive;
  const isWarning = timeLeft <= 10 && timeLeft > 0 && isActive;

  const value: TimerContextType = useMemo(
    () => ({
      isActive,
      timeLeft,
      duration,
      isPaused,
      isComplete,
      isWarning,
      progressPercentage,
      isPinned,
      startTimer,
      pauseTimer,
      resumeTimer,
      resetTimer,
      skipTimer,
      stopTimer,
      formatTime,
    }),
    [
      isActive,
      timeLeft,
      duration,
      isPaused,
      isComplete,
      isWarning,
      progressPercentage,
      isPinned,
      startTimer,
      pauseTimer,
      resumeTimer,
      resetTimer,
      skipTimer,
      stopTimer,
      formatTime,
    ]
  );

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}
