import { GlassHeader } from "@components/GlassHeader";
import { Tabs } from "expo-router";
import { BarChart, Dumbbell, Home, Settings } from "lucide-react-native";
import { useColorScheme } from "nativewind";

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerTransparent: true,
        header: ({ options }) => (
          <GlassHeader title={options.title} showBack={false} />
        ),
        tabBarStyle: {
          backgroundColor: isDark ? "#0f172a" : "#ffffff",
          borderTopColor: isDark ? "#1e293b" : "#e2e8f0",
        },
        tabBarActiveTintColor: "#6366f1",
        tabBarInactiveTintColor: isDark ? "#94a3b8" : "#64748b",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          tabBarIcon: ({ color }) => <Dumbbell size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color }) => <BarChart size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
