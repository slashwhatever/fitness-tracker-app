import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
} from "@notifee/react-native";
import { Platform } from "react-native";

// Notification IDs
const TIMER_NOTIFICATION_ID = "rest-timer-notification";
const TIMER_CHANNEL_ID = "rest-timer-channel";

// Helper to format time for notification
const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

/**
 * Registers the foreground service task handler.
 * MUST be called at app startup (in index.js or App.tsx root).
 */
export function registerForegroundService(): void {
  if (Platform.OS !== "android") return;

  notifee.registerForegroundService((notification) => {
    return new Promise(() => {
      // Keep the service running - it will be stopped when we call stopForegroundService()
      // The timer logic runs in the JS thread, this just keeps the notification alive
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

  try {
    await notifee.stopForegroundService();
  } catch {
    // Foreground service might not be running
  }

  await notifee.cancelNotification(TIMER_NOTIFICATION_ID);
}
