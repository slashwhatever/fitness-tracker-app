import { GlassHeader } from "@components/GlassHeader";
import { Stack } from "expo-router";

export default function WorkoutsLayout() {
  return (
    <Stack
      screenOptions={{
        header: ({ options }) => (
          <GlassHeader title={options.title || "Workouts"} showBack={false} />
        ),
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="new" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]/movement/[movementId]/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="[id]/movement/[movementId]/settings"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="[id]/index" options={{ headerShown: false }} />
    </Stack>
  );
}
