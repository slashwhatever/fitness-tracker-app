import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RestTimer } from "@/components/RestTimer";
import { RestTimerProvider } from "@/components/RestTimerProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/lib/auth/AuthProvider";
import {
  registerBackgroundEventHandler,
  registerForegroundService,
} from "@/services/notificationService";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

// Register the foreground service and background event handler at app startup
registerForegroundService();
registerBackgroundEventHandler();

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
  const segments = useSegments();
  const router = useRouter();
  const rootNavState = useRootNavigationState();

  // Check if we're on an auth route (login, register, confirm)
  const isAuthRoute =
    segments[0] === "login" ||
    segments[0] === "register" ||
    segments[0] === "confirm";

  // reset-password is reachable in BOTH auth states: unauthenticated (the
  // "Forgot password?" email-request flow) and authenticated-via-recovery (the
  // new-password flow after the recovery deep link exchanges a session). Keep
  // it out of isAuthRoute so a recovery session isn't bounced to home.
  const isResetRoute = segments[0] === "reset-password";

  // Drive auth redirects imperatively against the ALWAYS-mounted Stack below.
  // Previously this component returned <Redirect> *instead of* the <Stack>,
  // which unmounted the navigator mid-transition and produced the dev warning
  // "The action 'REPLACE' ... was not handled by any navigator" on login.
  // Guarding on rootNavState?.key ensures we never navigate before the root
  // navigator is mounted.
  useEffect(() => {
    if (loading || !rootNavState?.key) return;

    if (!session && !isAuthRoute && !isResetRoute) {
      router.replace("/login");
    } else if (session && isAuthRoute) {
      router.replace("/");
    }
  }, [loading, session, isAuthRoute, isResetRoute, rootNavState?.key, router]);

  if (loading) {
    return null;
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
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="confirm" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password" options={{ headerShown: false }} />
    </Stack>
  );
}

// Inner layout removed - using simple stacking with Absolute Timer
export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <AuthProvider>
              <ThemeProvider>
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
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
