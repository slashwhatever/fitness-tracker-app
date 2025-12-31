import { Ionicons } from "@expo/vector-icons";
import { useRestTimer } from "@fitness/shared";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import twColors from "tailwindcss/colors";
import { useThemeColors } from "../hooks/useThemeColors";

export const REST_TIMER_HEIGHT = 60;

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Helper helper to format time
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export const RestTimer = () => {
  const {
    isActive,
    isCompleted,
    duration,
    remainingTime,
    pauseTimer,
    resumeTimer,
    resetTimer,
    cancelTimer,
    isPaused,
    addTime,
  } = useRestTimer();
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // Safe Platform check for web/android specific logic if needed
  const isAndroid =
    typeof Platform !== "undefined" && Platform.OS === "android";

  useEffect(() => {
    async function requestPermissions() {
      if (typeof Platform !== "undefined" && Platform.OS !== "web") {
        await Notifications.requestPermissionsAsync();
      }
    }
    requestPermissions();
  }, []);

  useEffect(() => {
    if (isCompleted) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (typeof Platform !== "undefined" && Platform.OS !== "web") {
        Notifications.scheduleNotificationAsync({
          content: {
            title: "Rest Finished",
            body: "Get back to work!",
          },
          trigger: null, // Immediate
        });
      }
    }
  }, [isCompleted]);

  const progress = duration > 0 ? remainingTime / duration : 0;
  const fillPercentage = (1 - progress) * 100;

  // Color calculation
  const color = useMemo(() => {
    if (isCompleted) return twColors.green[500]; // Success
    // Primary -> Orange -> Red
    // Primary (100% -> 50%), Orange (50% -> 20%), Red (< 20%)
    if (progress > 0.5) return theme.primary[500];
    if (progress > 0.2) return twColors.orange[500];
    return theme.danger;
  }, [progress, isCompleted, theme]);

  if (!isActive && !isCompleted) return null;

  return (
    <BlurView
      intensity={50}
      experimentalBlurMethod="dimezisBlurView"
      tint={isDark ? "systemThickMaterialDark" : "systemThickMaterialLight"}
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          height: insets.top + REST_TIMER_HEIGHT,
          backgroundColor: isAndroid
            ? "transparent" // Ensure transparency on Android for blur to work
            : isDark
              ? "rgba(15,23,42,0.5)"
              : "rgba(255,255,255,0.5)",
          borderBottomColor: theme.border,
        },
      ]}
    >
      {/* Progress Bar Background */}
      <View style={[styles.progressBarBg, { backgroundColor: theme.muted }]}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${fillPercentage}%`, backgroundColor: color },
          ]}
        />
      </View>

      <View style={styles.content}>
        {/* Time Display */}
        <Text style={[styles.timerText, { color: theme.text }]}>
          {formatTime(remainingTime)}
        </Text>

        {/* Controls */}
        <View style={styles.controls}>
          {/* +30s */}
          <TouchableOpacity
            onPress={() => addTime(30)}
            style={styles.iconButton}
          >
            <Text style={[styles.addTimeText, { color: theme.text }]}>
              +30s
            </Text>
          </TouchableOpacity>

          {/* Pause/Play */}
          <TouchableOpacity
            onPress={isPaused ? resumeTimer : pauseTimer}
            style={styles.iconButton}
          >
            <Ionicons
              name={isPaused ? "play" : "pause"}
              size={24}
              color={theme.text}
            />
          </TouchableOpacity>

          {/* Reset */}
          <TouchableOpacity onPress={resetTimer} style={styles.iconButton}>
            <Ionicons name="refresh" size={24} color={theme.text} />
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity onPress={cancelTimer} style={styles.iconButton}>
            <Ionicons name="close" size={24} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    width: "100%",
    flexDirection: "column",
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  progressBarBg: {
    height: 4,
    width: "100%",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  timerText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    fontVariant: ["tabular-nums"],
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  addTimeText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
