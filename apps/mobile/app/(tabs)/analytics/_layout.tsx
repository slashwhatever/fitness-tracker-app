import { Stack } from "expo-router";
import { GlassHeader } from "../../../components/GlassHeader";

export default function AnalyticsLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        header: ({ options }) => (
          <GlassHeader title={options.title || "Analytics"} showBack={false} />
        ),
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Analytics" }} />
    </Stack>
  );
}
