import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Returns the recommended bottom padding for scrollable content to avoid
 * being hidden behind the bottom tab bar or home indicator.
 *
 * @param extraPadding Additional padding to add on top of the safe area inset (default: 16)
 */
export function useBottomPadding(extraPadding = 16) {
  const insets = useSafeAreaInsets();
  // NativeTabs height plus home indicator usually requires significant padding.
  // 80 is a safe default to clear the tab bar comfortably.
  return insets.bottom + Math.max(extraPadding, 80);
}
