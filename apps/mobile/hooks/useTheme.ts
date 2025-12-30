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
  }, [setColorScheme, systemColorScheme]);

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
