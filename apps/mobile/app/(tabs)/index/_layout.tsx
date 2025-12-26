import { Stack } from "expo-router";
import { GlassHeader } from "../../../components/GlassHeader";

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        header: ({ options }) => (
          <GlassHeader title={options.title || "Home"} showBack={false} />
        ),
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="home-screen" options={{ title: "Home" }} />
    </Stack>
  );
}
