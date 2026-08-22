import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import logger from "@/lib/utils/logger";
import { useThemeColors } from "@hooks/useThemeColors";
import { Link, useRouter } from "expo-router";
import { Check, Dumbbell, Eye, EyeOff, MailCheck, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// The password-reset email links back into the app via this deep link. The
// useDeepLink hook exchanges the recovery token and re-navigates here, at which
// point there is an active session and this screen switches to "update" mode.
const RESET_REDIRECT_TO = "logset://reset-password";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRequirements: { label: string; test: (p: string) => boolean }[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Contains number", test: (p) => /\d/.test(p) },
];

/**
 * Dual-mode password reset screen.
 *
 * - No active session ("Forgot your password?" from login): collect an email
 *   and send a recovery link via resetPasswordForEmail.
 * - Active recovery session (arrived via the recovery deep link, which
 *   useDeepLink exchanges before routing here): collect a new password and
 *   commit it via updateUser.
 */
export default function ResetPasswordScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const colors = useThemeColors();

  const mode: "request" | "update" = session ? "update" : "request";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // request mode
  const [email, setEmail] = useState("");

  // update mode
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordValidation = useMemo(
    () => passwordRequirements.map((req) => ({ ...req, valid: req.test(password) })),
    [password]
  );
  const passwordValid = passwordValidation.every((r) => r.valid);
  const passwordsMatch = password === confirmPassword;

  const handleSendResetEmail = async () => {
    setError("");
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: RESET_REDIRECT_TO }
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setEmailSent(true);
    } catch (err) {
      logger.error("Password reset request error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setError("");
    if (!passwordValid) {
      setError("Password does not meet the requirements.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      // Session is now a fully authenticated one; send the user into the app.
      router.replace("/");
    } catch (err) {
      logger.error("Password update error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Confirmation view after a reset email has been sent.
  if (mode === "request" && emailSent) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-background">
        <View className="flex-1 px-6 justify-center max-w-md mx-auto w-full">
          <View className="items-center gap-4">
            <View className="bg-green-500/20 p-4 rounded-full">
              <MailCheck size={48} color={colors.success} />
            </View>
            <Text className="text-2xl font-bold text-center text-slate-900 dark:text-white">
              Check your email
            </Text>
            <Text className="text-slate-500 dark:text-gray-400 text-center text-base">
              We've sent a password reset link to {email.trim()}. Open it on this
              device to choose a new password.
            </Text>
            <Text className="text-slate-500 dark:text-gray-400 text-center text-sm mt-4">
              Didn't receive the email? Check your spam folder or{" "}
              <Text
                className="text-primary-400 font-semibold"
                onPress={() => {
                  setEmailSent(false);
                  setError("");
                }}
              >
                try again
              </Text>
            </Text>
            <Pressable
              onPress={() => router.replace("/login")}
              className="w-full bg-slate-200 dark:bg-card border border-border rounded-lg py-4 mt-4"
            >
              <Text className="text-center font-semibold text-slate-900 dark:text-white">
                Back to Sign In
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 justify-center max-w-md mx-auto w-full space-y-8">
            {/* Header */}
            <View className="items-center gap-2 mb-8">
              <View className="bg-primary/20 p-3 rounded-full mb-2">
                <Dumbbell
                  className="text-primary w-12 h-12"
                  size={48}
                  color={colors.tint}
                />
              </View>
              <Text className="text-3xl font-bold text-center text-slate-900 dark:text-white">
                {mode === "update" ? "Set a new password" : "Reset your password"}
              </Text>
              <Text className="text-slate-500 dark:text-gray-400 text-center text-base">
                {mode === "update"
                  ? "Choose a new password for your account"
                  : "Enter your email and we'll send you a reset link"}
              </Text>
            </View>

            {/* Form */}
            <View className="gap-4">
              {mode === "request" ? (
                <>
                  <Text className="text-sm font-medium text-slate-500 dark:text-gray-300">
                    Email address
                  </Text>
                  <TextInput
                    className="w-full bg-slate-50 dark:bg-card border border-border rounded-lg px-4 py-3 text-base text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textSecondary}
                    onChangeText={setEmail}
                    value={email}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                  />
                </>
              ) : (
                <>
                  <Text className="text-sm font-medium text-slate-500 dark:text-gray-300">
                    New password
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="w-full bg-slate-50 dark:bg-card border border-border rounded-lg px-4 py-3 text-base text-slate-900 dark:text-white pr-12 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      placeholder="Create a new password"
                      placeholderTextColor={colors.textSecondary}
                      onChangeText={setPassword}
                      value={password}
                      secureTextEntry={!showPassword}
                      editable={!loading}
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 h-full px-3 justify-center"
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={colors.icon} />
                      ) : (
                        <Eye size={20} color={colors.icon} />
                      )}
                    </Pressable>
                  </View>

                  {password.length > 0 && (
                    <View className="gap-1">
                      {passwordValidation.map((req, index) => (
                        <View key={index} className="flex-row items-center gap-2">
                          {req.valid ? (
                            <Check size={12} color={colors.success} />
                          ) : (
                            <X size={12} color={colors.textSecondary} />
                          )}
                          <Text
                            className={`text-xs ${
                              req.valid
                                ? "text-green-600"
                                : "text-slate-500 dark:text-gray-400"
                            }`}
                          >
                            {req.label}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <Text className="text-sm font-medium text-slate-500 dark:text-gray-300">
                    Confirm new password
                  </Text>
                  <TextInput
                    className="w-full bg-slate-50 dark:bg-card border border-border rounded-lg px-4 py-3 text-base text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    placeholder="Confirm your new password"
                    placeholderTextColor={colors.textSecondary}
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <Text className="text-sm text-red-500">
                      Passwords do not match
                    </Text>
                  )}
                </>
              )}

              {/* Error Message */}
              {error ? (
                <View className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <Text className="text-red-500 text-sm text-center">{error}</Text>
                </View>
              ) : null}

              {/* Submit Button */}
              <Pressable
                onPress={mode === "update" ? handleUpdatePassword : handleSendResetEmail}
                disabled={loading}
                className={`w-full bg-primary rounded-lg py-4 flex-row justify-center items-center h-[60px] ${
                  loading ? "opacity-70" : "active:opacity-90"
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="white" className="mr-2 h-[24px]" />
                ) : (
                  <Text className="text-white font-semibold text-base py-1">
                    {mode === "update" ? "Update password" : "Send reset link"}
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Footer Links */}
            {mode === "request" && (
              <View className="items-center space-y-4 pt-4">
                <View className="flex-row items-center">
                  <Text className="text-sm text-gray-400">
                    Remembered your password?{" "}
                  </Text>
                  <Link href="/login" asChild>
                    <Pressable>
                      <Text className="text-sm font-semibold text-primary-400">
                        Sign in
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
