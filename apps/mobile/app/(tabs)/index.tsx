import { useAuth } from "@fitness/shared";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, Text, View } from "react-native";
import { useHeaderPadding } from "../../hooks/useHeaderPadding";

export default function HomeScreen() {
  const { user } = useAuth();
  const headerPadding = useHeaderPadding();

  return (
    <View className="flex-1 bg-slate-50 dark:bg-dark-bg">
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 96, // 24 * 4
          paddingTop: headerPadding + 16, // Add some extra spacing below header
        }}
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-slate-500 dark:text-gray-400 text-sm font-medium">
              Welcome back,
            </Text>
            <Text className="text-2xl font-bold text-slate-900 dark:text-white">
              {user?.email?.split("@")[0] || "Athlete"}
            </Text>
          </View>
          <View className="h-10 w-10 rounded-full bg-primary-500 items-center justify-center">
            <Text className="text-white font-bold text-lg">
              {(user?.email?.[0] || "A").toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Quick Stats Card */}

        <LinearGradient
          colors={["#6366f1", "#4f46e5", "#4338ca"]}
          className="rounded-3xl p-6 mb-6 shadow-lg shadow-indigo-500/30"
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text className="text-indigo-100 font-medium mb-1">
            Weekly Volume
          </Text>
          <Text className="text-4xl font-bold text-white mb-4">12,450 kg</Text>
          <View className="flex-row space-x-2">
            <View className="bg-white/20 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-medium">
                ↑ 12% vs last week
              </Text>
            </View>
          </View>
        </LinearGradient>

        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Recent Activity
        </Text>

        {/* Placeholder for recent workouts */}
        <View className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-slate-200 dark:border-dark-border mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-slate-900 dark:text-white font-semibold text-lg">
              Upper Body Power
            </Text>
            <Text className="text-slate-500 dark:text-gray-400 text-sm">
              Yesterday
            </Text>
          </View>
          <Text className="text-slate-500 dark:text-gray-500 text-sm">
            5 exercises • 45 mins
          </Text>
        </View>

        <View className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-slate-200 dark:border-dark-border">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-slate-900 dark:text-white font-semibold text-lg">
              Leg Day
            </Text>
            <Text className="text-slate-500 dark:text-gray-400 text-sm">
              3 days ago
            </Text>
          </View>
          <Text className="text-slate-500 dark:text-gray-500 text-sm">
            6 exercises • 60 mins
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
