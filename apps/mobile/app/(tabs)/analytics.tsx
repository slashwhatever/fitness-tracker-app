import { Text, View } from "react-native";
import { GlassHeader } from "../../components/GlassHeader";

export default function AnalyticsScreen() {
  return (
    <View className="flex-1 bg-slate-50 dark:bg-dark-bg">
      <GlassHeader title="Analytics" showBack={false} />
      <View className="flex-1 p-4 pt-[120px]">
        <View className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-slate-200 dark:border-dark-border">
          <Text className="text-slate-500 dark:text-gray-400">
            Charts coming soon...
          </Text>
        </View>
      </View>
    </View>
  );
}
