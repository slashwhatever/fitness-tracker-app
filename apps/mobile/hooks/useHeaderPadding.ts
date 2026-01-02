import { HEADER_CONTENT_HEIGHT } from "@/components/GlassHeader";
import { REST_TIMER_HEIGHT } from "@/components/RestTimer";
import { useRestTimer } from "@fitness/shared";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useHeaderPadding(options?: { ignoreTimer?: boolean }) {
  const insets = useSafeAreaInsets();
  const { isActive, isCompleted } = useRestTimer();
  let headerHeight = 0;
  try {
    headerHeight = useHeaderHeight();
  } catch (e) {
    // Ignore error - useHeaderHeight throws if not in a screen with a header
  }

  // If headerHeight is 0 (not in a navigation header context), fallback to manual calculation
  const baseHeight =
    headerHeight > 0 ? headerHeight : insets.top + HEADER_CONTENT_HEIGHT;

  const timerHeight =
    (isActive || isCompleted) && !options?.ignoreTimer ? REST_TIMER_HEIGHT : 0;
  return baseHeight + timerHeight;
}
