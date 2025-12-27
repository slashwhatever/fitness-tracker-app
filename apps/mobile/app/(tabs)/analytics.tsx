import { useBottomPadding } from "@hooks/useBottomPadding";
import { useHeaderPadding } from "@hooks/useHeaderPadding";
import { Text, View } from "react-native";

export default function AnalyticsScreen() {
  const headerPadding = useHeaderPadding();
  const bottomPadding = useBottomPadding();

  return (
    <View className="flex-1 bg-slate-50 dark:bg-dark-bg">
      <View
        className="flex-1 p-4"
        style={{ paddingTop: headerPadding + 16, paddingBottom: bottomPadding }}
      >
        <View className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-slate-200 dark:border-dark-border">
          <Text className="text-slate-500 dark:text-gray-400">
            Charts coming soon...
          </Text>
        </View>
      </View>
    </View>
  );
}
