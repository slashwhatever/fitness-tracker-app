import { useUserProfile } from "@fitness/shared";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import { useEffect } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: userProfile } = useUserProfile();
  const systemColorScheme = useSystemColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();

  useEffect(() => {
    if (!userProfile?.theme) return;

    const theme = userProfile.theme;
    if (theme === "system") {
      setColorScheme("system");
    } else {
      setColorScheme(theme as "light" | "dark" | "system");
    }
  }, [userProfile?.theme, systemColorScheme, setColorScheme]);

  return <>{children}</>;
}
