import { HEADER_CONTENT_HEIGHT } from "@/components/GlassHeader";
import { REST_TIMER_HEIGHT } from "@/components/RestTimer";
import { useRestTimer } from "@fitness/shared";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useHeaderPadding(options?: { ignoreTimer?: boolean }) {
  const insets = useSafeAreaInsets();
  const { isActive, isCompleted } = useRestTimer();
  const timerHeight =
    (isActive || isCompleted) && !options?.ignoreTimer ? REST_TIMER_HEIGHT : 0;
  return insets.top + HEADER_CONTENT_HEIGHT + timerHeight;
}
