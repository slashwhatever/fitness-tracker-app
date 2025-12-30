import { useAuth } from "@/lib/auth/AuthProvider";
import { useBottomPadding } from "@hooks/useBottomPadding";
import { useHeaderPadding } from "@hooks/useHeaderPadding";
import { useHomeStats } from "@hooks/useHomeStats";
import { formatDistanceToNow } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const { user } = useAuth();
  const headerPadding = useHeaderPadding();
  const bottomPadding = useBottomPadding();
  const router = useRouter();
  const { data: stats, isLoading, refetch } = useHomeStats();

  const formatVolume = (vol: number) => {
    return Math.round(vol).toLocaleString();
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: bottomPadding, // 24 * 4
          paddingTop: headerPadding + 32, // Increased based on user feedback (cut off)
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#6366f1"
            progressViewOffset={headerPadding}
          />
        }
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-slate-500 dark:text-gray-400 text-sm font-medium">
              Welcome back,
            </Text>
            <Text className="text-2xl font-bold text-foreground">
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
        <View
          className="mb-6 rounded-3xl bg-primary-500 mx-1"
          style={{
            elevation: 8,
            shadowColor: "#4f46e5",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
          }}
        >
          <LinearGradient
            colors={["#6366f1", "#4f46e5", "#4338ca"]}
            className="rounded-3xl p-6"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text className="text-indigo-100 font-medium mb-1">
              Weekly Volume
            </Text>
            <Text className="text-4xl font-bold text-white mb-4">
              {stats ? `${formatVolume(stats.weekly_volume)} kg` : "0 kg"}
            </Text>
            <View className="flex-row space-x-2">
              <View className="bg-white/20 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-medium">
                  {stats?.weekly_volume_change !== undefined
                    ? `${stats.weekly_volume_change >= 0 ? "↑" : "↓"} ${Math.abs(
                        stats.weekly_volume_change
                      )}% vs last week`
                    : "-"}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <Text className="text-lg font-bold text-foreground mb-4">
          Recent Activity
        </Text>

        {stats?.recent_activity.map((activity) => (
          <TouchableOpacity
            key={`${activity.workout_id}-${activity.last_activity_date}`}
            className="bg-card p-4 rounded-2xl border border-border mb-4"
            onPress={() => router.push(`/workout/${activity.workout_id}`)}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-foreground font-semibold text-lg">
                {activity.name}
              </Text>
              <Text className="text-slate-500 dark:text-gray-400 text-sm">
                {formatDistanceToNow(new Date(activity.last_activity_date), {
                  addSuffix: true,
                })}
              </Text>
            </View>
            <Text className="text-slate-500 dark:text-gray-500 text-sm">
              {activity.exercise_count} exercises •{" "}
              {formatVolume(activity.session_volume)} kg
            </Text>
          </TouchableOpacity>
        ))}

        {!isLoading &&
          (!stats?.recent_activity || stats.recent_activity.length === 0) && (
            <View className="bg-card p-6 rounded-2xl border border-border items-center justify-center">
              <Text className="text-slate-500 dark:text-gray-400 text-center">
                No recent activity found. Start a workout!
              </Text>
            </View>
          )}
      </ScrollView>
    </View>
  );
}
