import { useAuth } from "@fitness/shared";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-bg p-4">
      <Text className="text-3xl font-bold text-white mb-8">Settings</Text>

      <TouchableOpacity
        onPress={handleSignOut}
        className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 active:bg-red-500/20"
      >
        <Text className="text-red-500 font-semibold text-center">Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
