import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

const THEME_STORAGE_KEY = "@theme_preference";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const { setColorScheme, colorScheme } = useNativeWindColorScheme();
  const systemColorScheme = useSystemColorScheme();
  const [storedTheme, setStoredTheme] = useState<Theme | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Apply system theme immediately on first render (before AsyncStorage loads)
  // This ensures the app respects system theme from the very start
  useEffect(() => {
    if (storedTheme === null && systemColorScheme) {
      // Before we know the stored preference, default to system
      setColorScheme(systemColorScheme);
    }
  }, [systemColorScheme, storedTheme, setColorScheme]);

  // Load theme from AsyncStorage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const theme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (theme) {
          const parsedTheme = theme as Theme;
          setStoredTheme(parsedTheme);
          // Apply the appropriate color scheme
          if (parsedTheme === "system") {
            // Force update to system scheme
            setColorScheme(systemColorScheme ?? "light");
          } else {
            setColorScheme(parsedTheme);
          }
        } else {
          // Default to system if no stored preference
          setStoredTheme("system");
          setColorScheme(systemColorScheme ?? "light");
        }
      } catch (error) {
        console.error("Failed to load theme from storage:", error);
        setStoredTheme("system");
        setColorScheme(systemColorScheme ?? "light");
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []); // Only run once on mount

  // Update color scheme when system theme changes (if user preference is "system")
  useEffect(() => {
    if (storedTheme === "system" && systemColorScheme) {
      setColorScheme(systemColorScheme);
    }
  }, [systemColorScheme, storedTheme, setColorScheme]);

  // Save theme to AsyncStorage
  const saveTheme = async (theme: Theme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      setStoredTheme(theme);
      // Apply the appropriate color scheme
      if (theme === "system") {
        setColorScheme(systemColorScheme ?? "light");
      } else {
        setColorScheme(theme);
      }
    } catch (error) {
      console.error("Failed to save theme to storage:", error);
    }
  };

  return {
    theme: storedTheme,
    colorScheme,
    systemColorScheme,
    isLoading,
    setTheme: saveTheme,
  };
}
