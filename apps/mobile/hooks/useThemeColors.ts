import { useColorScheme } from "nativewind";
import colors from "tailwindcss/colors";

// Import custom colors from config
// @ts-ignore - config is JS
import customColors from "../theme-colors.config.js";

export const Colors = {
  light: {
    tint: customColors.primary[500],
    text: colors.slate[900],
    textSecondary: colors.slate[500],
    background: "#ffffff",
    card: "#ffffff",
    muted: colors.slate[100],
    border: colors.slate[200],
    icon: colors.slate[500],
    iconActive: customColors.primary[500],
    danger: colors.red[500],
    "muted-foreground": colors.slate[500],
  },
  dark: {
    tint: customColors.primary[500],
    text: "#ffffff",
    textSecondary: colors.slate[400],
    background: colors.slate[900],
    card: colors.slate[800],
    muted: colors.slate[800],
    border: colors.slate[700],
    icon: colors.slate[400],
    iconActive: customColors.primary[500],
    danger: colors.red[500],
    "muted-foreground": colors.slate[400],
  },
};

export function useThemeColors() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return {
    ...Colors[isDark ? "dark" : "light"],
    primary: customColors.primary,
    isDark,
    colorScheme,
  };
}
