import { useUserProfile } from "@hooks/useUserProfile";
import { useColorScheme as useNativeWindColorScheme, vars } from "nativewind";
import { useEffect } from "react";
import { View, useColorScheme as useSystemColorScheme } from "react-native";

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
  const { data: userProfile } = useUserProfile();
  const systemColorScheme = useSystemColorScheme();
  const { setColorScheme, colorScheme } = useNativeWindColorScheme();

  useEffect(() => {
    if (!userProfile?.theme) return;

    const theme = userProfile.theme;
    if (theme === "system") {
      setColorScheme("system");
    } else {
      setColorScheme(theme as "light" | "dark" | "system");
    }
  }, [userProfile?.theme, systemColorScheme, setColorScheme]);

  // Apply theme variables based on current color scheme
  const isDark = colorScheme === "dark";
  const themeVars = isDark ? darkTheme : lightTheme;

  return (
    <View style={[themeVars, { flex: 1 }]} collapsable={false}>
      {children}
    </View>
  );
}
