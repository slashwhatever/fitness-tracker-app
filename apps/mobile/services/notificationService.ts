import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
} from "@notifee/react-native";
import { Platform } from "react-native";

// Notification IDs
const TIMER_NOTIFICATION_ID = "rest-timer-notification";
const TIMER_CHANNEL_ID = "rest-timer-channel";

// Headless timer state - tracked outside React for foreground service
let timerEndTime: number | null = null;
let timerDuration: number | null = null;
let headlessInterval: ReturnType<typeof setInterval> | null = null;

// Helper to format time for notification
const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

/**
 * Headless completion handler - called by foreground service when timer expires
 */
async function handleTimerComplete(): Promise<void> {
  // Clear tracking state
  timerEndTime = null;
  timerDuration = null;
  if (headlessInterval) {
    clearInterval(headlessInterval);
    headlessInterval = null;
  }

  // Stop the foreground service first
  await notifee.stopForegroundService();

  // Create a high-importance channel for completion alert
  await notifee.createChannel({
    id: "rest-timer-complete",
    name: "Rest Timer Complete",
    description: "Alert when rest timer finishes",
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    sound: "default",
    vibration: true,
  });

  // Show completion notification with sound/vibration
  await notifee.displayNotification({
    id: TIMER_NOTIFICATION_ID,
    title: "Rest Complete!",
    body: "Get back to work! 💪",
    android: {
      channelId: "rest-timer-complete",
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      pressAction: {
        id: "default",
        launchActivity: "default",
      },
      smallIcon: "ic_launcher",
    },
  });
}

/**
 * Registers the foreground service task handler.
 * MUST be called at app startup (in index.js or App.tsx root).
 *
 * This headless task runs independently of the main JS thread and will
 * fire the completion notification even when the phone is locked.
 */
export function registerForegroundService(): void {
  if (Platform.OS !== "android") return;

  notifee.registerForegroundService(() => {
    return new Promise<void>((resolve) => {
      // Clear any existing interval
      if (headlessInterval) {
        clearInterval(headlessInterval);
        headlessInterval = null;
      }

      // Check timer status every second
      headlessInterval = setInterval(async () => {
        // If timer was cancelled or paused, just wait
        if (!timerEndTime || !timerDuration) {
          return;
        }

        const now = Date.now();
        const remainingMs = timerEndTime - now;
        const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

        if (remainingSeconds <= 0) {
          // Timer expired - fire completion
          await handleTimerComplete();
          resolve();
        } else {
          // Update notification with countdown (keeps service alive)
          try {
            await notifee.displayNotification({
              id: TIMER_NOTIFICATION_ID,
              title: "Rest Timer",
              body: `${formatTime(remainingSeconds)} remaining`,
              android: {
                channelId: TIMER_CHANNEL_ID,
                asForegroundService: true,
                ongoing: true,
                onlyAlertOnce: true,
                category: AndroidCategory.PROGRESS,
                visibility: AndroidVisibility.PUBLIC,
                pressAction: {
                  id: "default",
                  launchActivity: "default",
                },
                progress: {
                  max: timerDuration,
                  current: timerDuration - remainingSeconds,
                  indeterminate: false,
                },
                smallIcon: "ic_launcher",
              },
            });
          } catch {
            // Notification update failed, service may have been stopped
          }
        }
      }, 1000);
    });
  });
}

/**
 * Creates the notification channel for Android.
 * Must be called before displaying any notifications.
 */
export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") return;

  await notifee.createChannel({
    id: TIMER_CHANNEL_ID,
    name: "Rest Timer",
    description: "Shows countdown timer during rest periods",
    importance: AndroidImportance.LOW, // Low = no sound, but visible in shade
    visibility: AndroidVisibility.PUBLIC,
  });
}

/**
 * Starts the foreground service timer notification with countdown.
 */
export async function startTimerNotification(
  duration: number,
  remainingTime: number
): Promise<void> {
  if (Platform.OS !== "android") return;

  // Set headless timer state so foreground service can track independently
  timerEndTime = Date.now() + remainingTime * 1000;
  timerDuration = duration;

  await notifee.displayNotification({
    id: TIMER_NOTIFICATION_ID,
    title: "Rest Timer",
    body: `${formatTime(remainingTime)} remaining`,
    android: {
      channelId: TIMER_CHANNEL_ID,
      asForegroundService: true,
      ongoing: true, // Cannot be dismissed
      onlyAlertOnce: true, // Don't vibrate/sound on updates
      category: AndroidCategory.PROGRESS,
      visibility: AndroidVisibility.PUBLIC,
      pressAction: {
        id: "default",
        launchActivity: "default",
      },
      progress: {
        max: duration,
        current: duration - remainingTime,
        indeterminate: false,
      },
      smallIcon: "ic_launcher", // Uses the app launcher icon
    },
  });
}

/**
 * Updates the timer notification with new remaining time.
 */
export async function updateTimerNotification(
  duration: number,
  remainingTime: number
): Promise<void> {
  if (Platform.OS !== "android") return;

  await notifee.displayNotification({
    id: TIMER_NOTIFICATION_ID,
    title: "Rest Timer",
    body: `${formatTime(remainingTime)} remaining`,
    android: {
      channelId: TIMER_CHANNEL_ID,
      asForegroundService: true,
      ongoing: true,
      onlyAlertOnce: true,
      category: AndroidCategory.PROGRESS,
      visibility: AndroidVisibility.PUBLIC,
      pressAction: {
        id: "default",
        launchActivity: "default",
      },
      progress: {
        max: duration,
        current: duration - remainingTime,
        indeterminate: false,
      },
      smallIcon: "ic_launcher",
    },
  });
}

/**
 * Updates the notification to show paused state.
 */
export async function pauseTimerNotification(
  remainingTime: number
): Promise<void> {
  if (Platform.OS !== "android") return;

  // Clear headless timer state when paused
  timerEndTime = null;
  timerDuration = null;

  await notifee.displayNotification({
    id: TIMER_NOTIFICATION_ID,
    title: "Rest Timer (Paused)",
    body: `${formatTime(remainingTime)} remaining`,
    android: {
      channelId: TIMER_CHANNEL_ID,
      asForegroundService: true,
      ongoing: true,
      onlyAlertOnce: true,
      category: AndroidCategory.PROGRESS,
      visibility: AndroidVisibility.PUBLIC,
      pressAction: {
        id: "default",
        launchActivity: "default",
      },
      smallIcon: "ic_launcher",
    },
  });
}

/**
 * Shows completion notification with alert.
 */
export async function completeTimerNotification(): Promise<void> {
  if (Platform.OS !== "android") return;

  // Stop the foreground service first
  await notifee.stopForegroundService();

  // Create a high-importance channel for completion alert
  await notifee.createChannel({
    id: "rest-timer-complete",
    name: "Rest Timer Complete",
    description: "Alert when rest timer finishes",
    importance: AndroidImportance.HIGH, // High = sound + heads-up
    visibility: AndroidVisibility.PUBLIC,
    sound: "default",
    vibration: true,
  });

  // Show completion notification with sound/vibration
  await notifee.displayNotification({
    id: TIMER_NOTIFICATION_ID,
    title: "Rest Complete!",
    body: "Get back to work! 💪",
    android: {
      channelId: "rest-timer-complete",
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      pressAction: {
        id: "default",
        launchActivity: "default",
      },
      smallIcon: "ic_launcher",
    },
  });
}

/**
 * Cancels/dismisses the timer notification.
 */
export async function cancelTimerNotification(): Promise<void> {
  if (Platform.OS !== "android") return;

  // Clear headless timer state
  timerEndTime = null;
  timerDuration = null;
  if (headlessInterval) {
    clearInterval(headlessInterval);
    headlessInterval = null;
  }

  try {
    await notifee.stopForegroundService();
  } catch {
    // Foreground service might not be running
  }

  await notifee.cancelNotification(TIMER_NOTIFICATION_ID);
}
