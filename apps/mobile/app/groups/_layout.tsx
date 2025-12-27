import { Stack } from "expo-router";

export default function GroupsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="modal"
        options={{
          presentation: "modal",
          headerShown: false, // We implemented a custom safe area view or title in the screen
          title: "Manage Groups",
        }}
      />
    </Stack>
  );
}
