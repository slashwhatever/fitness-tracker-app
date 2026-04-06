import { useGlassHeaderContext } from "@/components/GlassHeaderContext";
import { REST_TIMER_HEIGHT } from "@/components/RestTimer";
import { useRestTimer } from "@hooks/useRestTimer";
import { useThemeColors } from "@hooks/useThemeColors";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useEffect, useId } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface GlassHeaderProps {
  title?: React.ReactNode;
  subtitle?: string;
  backPath?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  onBack?: () => void;
  ignoreTimer?: boolean;
}

export const HEADER_CONTENT_HEIGHT = 60;

export function GlassHeader({
  title,
  subtitle,
  backPath,
  showBack = true,
  rightAction,

  onBack,
  ignoreTimer = false,
}: GlassHeaderProps) {
  const router = useRouter();

  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = useThemeColors();
  const { isActive, isCompleted } = useRestTimer();
  const headerId = useId();
  const headerContext = useGlassHeaderContext();

  // Register this header on mount, unregister on unmount
  useEffect(() => {
    headerContext?.registerHeader(headerId);
    return () => {
      headerContext?.unregisterHeader(headerId);
    };
  }, [headerId, headerContext]);

  const isTimerActive = (isActive || isCompleted) && !ignoreTimer;

  const containerTop = isTimerActive ? insets.top + REST_TIMER_HEIGHT : 0;
  const containerHeight = isTimerActive
    ? HEADER_CONTENT_HEIGHT
    : insets.top + HEADER_CONTENT_HEIGHT;
  const contentPaddingTop = isTimerActive ? 0 : insets.top;

  // Check if this header should be visible (only the topmost one)
  const isActiveHeader = headerContext?.isActiveHeader(headerId) ?? true;

  // Only render if this is the active (topmost) header
  if (!isActiveHeader) {
    return null;
  }

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else if (backPath) {
      router.replace(backPath);
    } else {
      router.replace("/(tabs)/workouts");
    }
  };

  return (
    <View
      style={[
        {
          position: "absolute",
          left: 0,
          right: 0,
          top: containerTop,
          height: containerHeight,
          backgroundColor: isDark
            ? "rgba(15,23,42,0.85)"
            : "rgba(255,255,255,0.85)",
          zIndex: 50,
          borderBottomWidth: 1,
          borderBottomColor: isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.1)",
        },
      ]}
    >
      <View
        style={{
          paddingTop: contentPaddingTop,
        }}
        className="flex-1 px-4 flex-row items-center justify-between"
      >
        <View className="flex-1 flex-row items-center">
          {showBack && (
            <TouchableOpacity
              onPress={handleBack}
              className="flex-row items-center p-2 -ml-2 mr-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ChevronLeft size={24} color={colors.text} />
              {typeof title === "string" && (
                <Text
                  className="text-foreground text-lg font-semibold ml-1"
                  numberOfLines={1}
                >
                  {typeof title === "string" ? title : "Back"}
                </Text>
              )}
            </TouchableOpacity>
          )}
          {!showBack && typeof title === "string" && (
            <View>
              <Text className="text-foreground font-bold text-3xl">
                {title}
              </Text>
              {subtitle && (
                <Text className="text-slate-500 dark:text-gray-400 text-xs">
                  {subtitle}
                </Text>
              )}
            </View>
          )}
          {/* Custom title node/component logic can be expanded here if needed */}
        </View>

        <View className="flex-row items-center justify-end min-w-[40px]">
          {rightAction}
        </View>
      </View>
    </View>
  );
}
