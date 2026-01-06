import { RestTimer } from "@/components/RestTimer";
import { RestTimerProvider } from "@/components/RestTimerProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/lib/auth/AuthProvider";
import * as Sentry from "@sentry/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Slot, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

Sentry.init({
  dsn: "https://06088e1edfbe92504a8f41b5e9c5f5c1@o4510658313125888.ingest.de.sentry.io/4510658314436688",

  // Adds more context data to events (IP address, cookies, user, etc.)
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay - web uses different sample rates
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
});

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

function AppContent() {
  const { session, loading } = useAuth();
  const segments = useSegments();

  if (loading) {
    return null;
  }

  // Check if we're on an auth route (login, register, confirm)
  const isAuthRoute =
    segments[0] === "login" ||
    segments[0] === "register" ||
    segments[0] === "confirm";

  // If not authenticated and trying to access protected routes, redirect to login
  if (!session && !isAuthRoute) {
    return <Redirect href="/login" />;
  }

  // If authenticated and on auth routes, redirect to home
  if (session && isAuthRoute) {
    return <Redirect href="/" />;
  }

  return <Slot />;
}

export default Sentry.wrap(function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider>
            <RestTimerProvider>
              <View className="flex-1 bg-white dark:bg-slate-900">
                <StatusBar style="auto" />
                <AppContent />
                <RestTimer />
              </View>
            </RestTimerProvider>
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
});
