import { createClient } from "@/lib/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useThemeColors } from "@hooks/useThemeColors";
import { Link, useRouter } from "expo-router";
import { Check, Dumbbell, Eye, EyeOff, X } from "lucide-react-native";
import { useMemo, useState } from "react";
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

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Contains number", test: (p) => /\d/.test(p) },
];

const formSchema = z
  .object({
    displayName: z
      .string()
      .min(1, "Display name is required")
      .min(2, "Display name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const colors = useThemeColors();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const watchedPassword = watch("password");

  const passwordValidation = useMemo(() => {
    return passwordRequirements.map((req) => ({
      ...req,
      valid: req.test(watchedPassword || ""),
    }));
  }, [watchedPassword]);

  const onSubmit = async (values: FormData) => {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            display_name: values.displayName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        setSuccess(true);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-background">
        <View className="flex-1 px-6 justify-center max-w-md mx-auto w-full">
          <View className="items-center gap-4">
            <View className="bg-green-500/20 p-4 rounded-full">
              <Check size={48} color={colors.success} />
            </View>
            <Text className="text-2xl font-bold text-center text-slate-900 dark:text-white">
              Check your email
            </Text>
            <Text className="text-slate-500 dark:text-gray-400 text-center text-base">
              We've sent you a confirmation link to complete your registration.
            </Text>
            <Text className="text-slate-500 dark:text-gray-400 text-center text-sm mt-4">
              Didn't receive the email? Check your spam folder or{" "}
              <Text
                className="text-primary-400 font-semibold"
                onPress={() => {
                  setSuccess(false);
                  reset();
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
                Create Account
              </Text>
              <Text className="text-slate-500 dark:text-gray-400 text-center text-base">
                Start tracking your fitness journey
              </Text>
            </View>

            {/* Form */}
            <View className="gap-4">
              {/* Display Name Input */}
              <Text className="text-sm font-medium text-slate-500 dark:text-gray-300">
                Display Name
              </Text>
              <Controller
                control={control}
                name="displayName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="w-full bg-slate-50 dark:bg-card border border-border rounded-lg px-4 py-3 text-base text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    placeholder="Enter your name"
                    placeholderTextColor={colors.textSecondary}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                )}
              />
              {errors.displayName && (
                <Text className="text-sm text-red-500">
                  {errors.displayName.message}
                </Text>
              )}

              {/* Email Input */}
              <Text className="text-sm font-medium text-slate-500 dark:text-gray-300">
                Email address
              </Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="w-full bg-slate-50 dark:bg-card border border-border rounded-lg px-4 py-3 text-base text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textSecondary}
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

              {/* Password Input */}
              <Text className="text-sm font-medium text-slate-500 dark:text-gray-300">
                Password
              </Text>
              <View className="relative">
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="w-full bg-slate-50 dark:bg-card border border-border rounded-lg px-4 py-3 text-base text-slate-900 dark:text-white pr-12 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      placeholder="Create a password"
                      placeholderTextColor={colors.textSecondary}
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
                    <EyeOff size={20} color={colors.icon} />
                  ) : (
                    <Eye size={20} color={colors.icon} />
                  )}
                </Pressable>
              </View>
              {errors.password && (
                <Text className="text-sm text-red-500">
                  {errors.password.message}
                </Text>
              )}

              {/* Password Requirements */}
              {watchedPassword && (
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

              {/* Confirm Password Input */}
              <Text className="text-sm font-medium text-slate-500 dark:text-gray-300">
                Confirm Password
              </Text>
              <View className="relative">
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="w-full bg-slate-50 dark:bg-card border border-border rounded-lg px-4 py-3 text-base text-slate-900 dark:text-white pr-12 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      placeholder="Confirm your password"
                      placeholderTextColor={colors.textSecondary}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!showConfirmPassword}
                      editable={!loading}
                    />
                  )}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-0 h-full px-3 justify-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={colors.icon} />
                  ) : (
                    <Eye size={20} color={colors.icon} />
                  )}
                </Pressable>
              </View>
              {errors.confirmPassword && (
                <Text className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </Text>
              )}

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
                disabled={loading || !isValid}
                className={`w-full bg-primary rounded-lg py-4 flex-row justify-center items-center h-[60px] ${
                  loading || !isValid ? "opacity-70" : "active:opacity-90"
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="white" className="mr-2 h-[24px]" />
                ) : (
                  <Text className="text-white font-semibold text-base py-1">
                    Create Account
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Footer Links */}
            <View className="items-center space-y-4 pt-4">
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-400">
                  Already have an account?{" "}
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
