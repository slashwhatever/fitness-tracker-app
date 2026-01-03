import { useThemeColors } from "@hooks/useThemeColors";
import { useRouter } from "expo-router";
import { CheckCircle, Loader2, XCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ConfirmEmailState {
  status: "loading" | "success" | "error";
  message: string;
}

/**
 * Screen displayed when user clicks email confirmation link.
 * The actual verification is handled by useDeepLink hook in AuthProvider.
 * This screen provides visual feedback during the process.
 */
export default function ConfirmEmailScreen() {
  const [state, setState] = useState<ConfirmEmailState>({
    status: "loading",
    message: "Verifying your email...",
  });
  const router = useRouter();
  const colors = useThemeColors();

  useEffect(() => {
    // The deep link hook handles verification automatically.
    // This screen primarily shows loading state.
    // If we're still here after 5 seconds, something went wrong.
    const timeout = setTimeout(() => {
      setState({
        status: "error",
        message: "Verification timed out. Please try again.",
      });
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  const handleContinue = () => {
    if (state.status === "success") {
      router.replace("/");
    } else {
      router.replace("/login");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background">
      <View className="flex-1 px-6 justify-center items-center max-w-md mx-auto w-full">
        <View className="items-center gap-6">
          {/* Status Icon */}
          {state.status === "loading" && (
            <View className="bg-primary/20 p-6 rounded-full">
              <Loader2 size={64} color={colors.tint} className="animate-spin" />
            </View>
          )}

          {state.status === "success" && (
            <View className="bg-green-500/20 p-6 rounded-full">
              <CheckCircle size={64} color={colors.success} />
            </View>
          )}

          {state.status === "error" && (
            <View className="bg-red-500/20 p-6 rounded-full">
              <XCircle size={64} color={colors.danger} />
            </View>
          )}

          {/* Status Text */}
          <Text className="text-2xl font-bold text-center text-slate-900 dark:text-white">
            {state.status === "loading" && "Verifying Email"}
            {state.status === "success" && "Email Verified!"}
            {state.status === "error" && "Verification Failed"}
          </Text>

          <Text className="text-slate-500 dark:text-gray-400 text-center text-base">
            {state.message}
          </Text>

          {/* Action Button */}
          {state.status !== "loading" && (
            <Pressable
              onPress={handleContinue}
              className="w-full bg-primary rounded-lg py-4 mt-4"
            >
              <Text className="text-center font-semibold text-white">
                {state.status === "success"
                  ? "Continue to App"
                  : "Back to Login"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
