import { useUpdateUserProfile, useUserProfile } from "@hooks/useUserProfile";
import { useColorScheme } from "nativewind";
import { Text, TouchableOpacity, View } from "react-native";

export function ThemeSelector() {
  const { data: userProfile } = useUserProfile();
  const { mutate: updateProfile } = useUpdateUserProfile();
  const { colorScheme } = useColorScheme();

  const currentTheme = userProfile?.theme ?? "system";

  const options = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "System", value: "system" },
  ] as const;

  const handleSelect = (value: "light" | "dark" | "system") => {
    updateProfile({ theme: value });
  };

  const isDark = colorScheme === "dark";

  return (
    <View className="flex-row rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
      {options.map((option) => {
        const isActive = currentTheme === option.value;
        const activeBg = isDark ? "#475569" : "#ffffff"; // slate-600 : white

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
