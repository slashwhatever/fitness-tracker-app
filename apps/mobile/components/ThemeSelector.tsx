import { useTheme } from "@hooks/useTheme";
import { useThemeColors } from "@hooks/useThemeColors";
import { useUpdateUserProfile, useUserProfile } from "@hooks/useUserProfile";
import { Text, TouchableOpacity, View } from "react-native";

export function ThemeSelector() {
  const { data: userProfile } = useUserProfile();
  const { mutate: updateProfile } = useUpdateUserProfile();
  const { theme, setTheme, colorScheme } = useTheme();
  const colors = useThemeColors();

  const currentTheme = theme ?? userProfile?.theme ?? "system";

  const options = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "System", value: "system" },
  ] as const;

  const handleSelect = (value: "light" | "dark" | "system") => {
    // Save to AsyncStorage immediately for instant persistence
    setTheme(value);
    // Also update user profile
    updateProfile({ theme: value });
  };

  const isDark = colorScheme === "dark";

  return (
    <View
      className="flex-row rounded-lg p-1"
      style={{
        backgroundColor: colors.muted,
      }}
    >
      {options.map((option) => {
        const isActive = currentTheme === option.value;
        // Use background color for active state to ensure visibility in dark mode
        const activeBg = colors.background;

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => handleSelect(option.value)}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              paddingVertical: 8,
              backgroundColor: isActive ? activeBg : "transparent",
              borderWidth: isActive ? 1 : 0,
              borderColor: isActive ? colors.border : "transparent",
              shadowOpacity: isActive && !isDark ? 0.1 : 0,
              shadowRadius: 2,
              shadowOffset: { width: 0, height: 1 },
              elevation: isActive && !isDark ? 2 : 0,
            }}
          >
            <Text
              className={`font-medium ${
                isActive
                  ? "text-foreground"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
