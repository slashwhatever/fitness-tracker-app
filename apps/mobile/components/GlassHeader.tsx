import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface GlassHeaderProps {
  title?: React.ReactNode;
  subtitle?: string;
  backPath?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  intensity?: number;
  onBack?: () => void;
  style?: any;
}

export const HEADER_CONTENT_HEIGHT = 60;

export function GlassHeader({
  title,
  subtitle,
  backPath,
  showBack = true,
  rightAction,
  intensity = 50,
  onBack,
}: GlassHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backPath) {
      router.replace(backPath);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/workouts");
    }
  };

  return (
    <BlurView
      intensity={intensity}
      experimentalBlurMethod="dimezisBlurView"
      tint={isDark ? "systemThickMaterialDark" : "systemThickMaterialLight"}
      style={[
        {
          backgroundColor: isDark
            ? "rgba(15,23,42,0.5)"
            : "rgba(255,255,255,0.5)",
        },
        // If used as a navigation header, absolute positioning might be redundant depending on parent,
        // but robust for ensure it covers what it needs to.
        // However, if we want to support non-absolute uses, we might want to make this configurable.
        // For now, keeping it absolute but allowing style override is safest.
      ]}
      className="absolute top-0 left-0 right-0 z-50 border-b border-slate-200/50 dark:border-white/10"
    >
      <View
        style={{
          paddingTop: insets.top,
          height: insets.top + HEADER_CONTENT_HEIGHT,
        }}
        className="px-4 flex-row items-center justify-between"
      >
        <View className="flex-1 flex-row items-center">
          {showBack && (
            <TouchableOpacity
              onPress={handleBack}
              className="flex-row items-center p-2 -ml-2 mr-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ChevronLeft size={24} color={isDark ? "#fff" : "#0f172a"} />
              {typeof title === "string" && (
                <Text
                  className="text-slate-900 dark:text-white text-lg font-semibold ml-1"
                  numberOfLines={1}
                >
                  {typeof title === "string" ? title : "Back"}
                </Text>
              )}
            </TouchableOpacity>
          )}
          {!showBack && typeof title === "string" && (
            <View>
              <Text className="text-slate-900 dark:text-white font-bold text-xl">
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
    </BlurView>
  );
}
