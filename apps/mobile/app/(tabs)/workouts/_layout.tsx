import { Stack } from "expo-router";
import { GlassHeader } from "../../../components/GlassHeader";

export default function WorkoutsLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        header: ({ options }) => (
          <GlassHeader title={options.title || "Workouts"} showBack={false} />
        ),
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Workouts" }} />
    </Stack>
  );
}
