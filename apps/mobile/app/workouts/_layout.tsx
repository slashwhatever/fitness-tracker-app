import { Stack } from "expo-router";
import { GlassHeader } from "../../components/GlassHeader";

export default function WorkoutsLayout() {
  return (
    <Stack
      screenOptions={{
        header: ({ options, navigation }) => (
          <GlassHeader title={options.title || "Workouts"} showBack={false} />
        ),
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="workouts-screen" options={{ title: "Workouts" }} />
      <Stack.Screen name="new" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]/movement/[movementId]"
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
