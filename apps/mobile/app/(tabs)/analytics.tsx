import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AnalyticsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-dark-bg p-4">
      <Text className="text-3xl font-bold text-white mb-4">Analytics</Text>
      <View className="bg-dark-card p-6 rounded-2xl border border-dark-border">
        <Text className="text-gray-400">Charts coming soon...</Text>
      </View>
    </SafeAreaView>
  );
}
