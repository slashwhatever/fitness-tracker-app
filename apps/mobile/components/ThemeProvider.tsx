import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useNativeWindColorScheme, vars } from "nativewind";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { View, useColorScheme as useSystemColorScheme } from "react-native";

const THEME_STORAGE_KEY = "@theme_preference";

export type Theme = "light" | "dark" | "system";

export interface ThemeContextValue {
  theme: Theme | null;
  colorScheme: "light" | "dark" | undefined;
  systemColorScheme: "light" | "dark" | null | undefined;
  isLoading: boolean;
  setTheme: (theme: Theme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Define theme CSS variables
const lightTheme = vars({
  "--color-background": "255 255 255",
  "--color-foreground": "15 23 42",
  "--color-card": "255 255 255",
  "--color-card-foreground": "15 23 42",
  "--color-border": "226 232 240",
  "--color-input": "248 250 252",
  "--color-muted": "248 250 252",
  "--color-muted-foreground": "100 116 139",
});

const darkTheme = vars({
  "--color-background": "15 23 42",
  "--color-foreground": "255 255 255",
  "--color-card": "30 41 59",
  "--color-card-foreground": "255 255 255",
  "--color-border": "51 65 85",
  "--color-input": "15 23 42",
  "--color-muted": "30 41 59",
  "--color-muted-foreground": "148 163 184",
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { setColorScheme, colorScheme } = useNativeWindColorScheme();
  const systemColorScheme = useSystemColorScheme();
  const [storedTheme, setStoredTheme] = useState<Theme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Apply system theme immediately on first render (before AsyncStorage loads)
  // This ensures the app respects system theme from the very start
  useEffect(() => {
    if (!hasInitialized && systemColorScheme) {
      // Before we know the stored preference, default to system
      setColorScheme(systemColorScheme);
    }
  }, [systemColorScheme, hasInitialized, setColorScheme]);

  // Load theme from AsyncStorage on mount - only once
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
        setHasInitialized(true);
      }
    };

    loadTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Update color scheme when system theme changes (if user preference is "system")
  useEffect(() => {
    if (hasInitialized && storedTheme === "system" && systemColorScheme) {
      setColorScheme(systemColorScheme);
    }
  }, [systemColorScheme, storedTheme, hasInitialized, setColorScheme]);

  // Save theme to AsyncStorage
  const saveTheme = useCallback(
    async (theme: Theme) => {
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
    },
    [setColorScheme, systemColorScheme]
  );

  const contextValue: ThemeContextValue = {
    theme: storedTheme,
    colorScheme,
    systemColorScheme,
    isLoading,
    setTheme: saveTheme,
  };

  // Apply theme variables based on current color scheme
  const isDark = colorScheme === "dark";
  const themeVars = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={contextValue}>
      <View style={[themeVars, { flex: 1 }]} collapsable={false}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
