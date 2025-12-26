import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { AuthProvider, useAuth } from "@fitness/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../components/ThemeProvider";
import "../global.css";
import LoginScreen from "./login"; // Ensure this import path is correct

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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (loading) {
    return null; // Or a splash screen
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        {Platform.select({
          ios: <Icon sf="house.fill" />,
          android: (
            <Icon src={<VectorIcon family={MaterialIcons} name="home" />} />
          ),
        })}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="workouts">
        <Label>Workouts</Label>
        {Platform.select({
          ios: <Icon sf="dumbbell.fill" />,
          android: (
            <Icon
              src={<VectorIcon family={MaterialIcons} name="fitness-center" />}
            />
          ),
        })}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="analytics">
        <Label>Analytics</Label>
        {Platform.select({
          ios: <Icon sf="chart.bar.fill" />,
          android: (
            <Icon
              src={<VectorIcon family={MaterialIcons} name="bar-chart" />}
            />
          ),
        })}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Label>Settings</Label>
        {Platform.select({
          ios: <Icon sf="gear" />,
          android: (
            <Icon src={<VectorIcon family={MaterialIcons} name="settings" />} />
          ),
        })}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider>
            <View className="flex-1 bg-white dark:bg-slate-900">
              <StatusBar style="auto" />
              <AppContent />
            </View>
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
