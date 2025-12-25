import { Stack } from "expo-router";
import { GlassHeader } from "../../../components/GlassHeader";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        header: ({ options }) => (
          <GlassHeader title={options.title || "Settings"} showBack={false} />
        ),
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Settings" }} />
    </Stack>
  );
}
