import { signInWithEmail } from "@fitness/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { Dumbbell, Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { z } from "zod";

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormData) => {
    setLoading(true);
    setError("");

    try {
      const { user, error: signInError } = await signInWithEmail(
        values.email,
        values.password
      );

      if (signInError) {
        setError(signInError);
        return;
      }

      if (user) {
        router.replace("/(tabs)");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-bg">
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
            <View className="items-center space-y-2">
              <View className="bg-primary/20 p-3 rounded-full mb-2">
                <Dumbbell
                  className="text-primary w-12 h-12"
                  size={48}
                  color="#6366f1"
                />
              </View>
              <Text className="text-3xl font-bold text-center text-white">
                Welcome to Logset
              </Text>
              <Text className="text-gray-400 text-center text-base">
                Sign in to your account to continue
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-4">
              {/* Email Input */}
              <View className="space-y-2">
                <Text className="text-sm font-medium text-gray-300">
                  Email address
                </Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-base text-white placeholder:text-gray-600"
                      placeholder="Enter your email"
                      placeholderTextColor="#64748b"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      editable={!loading}
                    />
                  )}
                />
                {errors.email && (
                  <Text className="text-sm text-red-500">
                    {errors.email.message}
                  </Text>
                )}
              </View>

              {/* Password Input */}
              <View className="space-y-2">
                <Text className="text-sm font-medium text-gray-300">
                  Password
                </Text>
                <View className="relative">
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-base text-white pr-12 placeholder:text-gray-600"
                        placeholder="Enter your password"
                        placeholderTextColor="#64748b"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        secureTextEntry={!showPassword}
                        editable={!loading}
                      />
                    )}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 justify-center"
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#94a3b8" />
                    ) : (
                      <Eye size={20} color="#94a3b8" />
                    )}
                  </Pressable>
                </View>
                {errors.password && (
                  <Text className="text-sm text-red-500">
                    {errors.password.message}
                  </Text>
                )}
              </View>

              {/* Error Message */}
              {error ? (
                <View className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <Text className="text-red-500 text-sm text-center">
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* Submit Button */}
              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
                className={`w-full bg-primary rounded-lg py-4 flex-row justify-center items-center ${
                  loading ? "opacity-70" : "active:opacity-90"
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="white" className="mr-2" />
                ) : (
                  <Text className="text-white font-semibold text-base py-1">
                    Sign in
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Footer Links */}
            <View className="items-center space-y-4 pt-4">
              <Link href="/reset-password" asChild>
                <Pressable>
                  <Text className="text-sm text-gray-400">
                    Forgot your password?
                  </Text>
                </Pressable>
              </Link>

              <View className="flex-row items-center">
                <Text className="text-sm text-gray-400">
                  Don't have an account?{" "}
                </Text>
                <Link href="/register" asChild>
                  <Pressable>
                    <Text className="text-sm font-semibold text-primary-400">
                      Sign up
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
