import { RestTimer } from "@/components/RestTimer";
import { RestTimerProvider } from "@/components/RestTimerProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/lib/auth/AuthProvider";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
import LoginScreen from "./login";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthenticatedApp() {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "transparent" },
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="workout"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="groups/modal"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      {/* Login route is technically available but we handle auth above */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}

// Inner layout removed - using simple stacking with Absolute Timer
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider>
            {/* Import RestTimerProvider dynamically or directly if shared package allows */}
            {/* Ideally we alias this in package.json or babel config but for now relative/alias imports */}
            <RestTimerProvider>
              <View className="flex-1 bg-background">
                <StatusBar style="auto" />
                <AuthenticatedApp />
                <RestTimer />
              </View>
            </RestTimerProvider>
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
