import { HEADER_CONTENT_HEIGHT } from "@/components/GlassHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useHeaderPadding() {
  const insets = useSafeAreaInsets();
  return insets.top + HEADER_CONTENT_HEIGHT;
}
