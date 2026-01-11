import {
  useThemeContext,
  type Theme,
  type ThemeContextValue,
} from "@/components/ThemeProvider";

/**
 * Hook to access and control the app theme.
 * This hook consumes the centralized ThemeContext from ThemeProvider.
 *
 * @returns Theme state and setTheme function
 */
export function useTheme(): ThemeContextValue {
  return useThemeContext();
}

export type { Theme, ThemeContextValue };
