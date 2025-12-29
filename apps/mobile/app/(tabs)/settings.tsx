import { useAuth } from "@/lib/auth/AuthProvider";
import { Button } from "@/components/Button";
import { ThemeSelector } from "@/components/ThemeSelector";
import { DistanceUnit, TIMER_PRESETS, WeightUnit } from "@fitness/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBottomPadding } from "@hooks/useBottomPadding";
import { useHeaderPadding } from "@hooks/useHeaderPadding";
import { useThemeColors } from "@hooks/useThemeColors";
import { useUpdateUserProfile, useUserProfile } from "@hooks/useUserProfile";
import { useRouter } from "expo-router";
import { ChevronDown, LogOut, Save, Undo2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";

interface SelectOption {
  label: string;
  value: string;
}

function SelectModal({
  visible,
  options,
  value,
  onSelect,
  onClose,
  title,
}: {
  visible: boolean;
  options: SelectOption[];
  value: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  title: string;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <View className="bg-card rounded-t-3xl overflow-hidden pb-8 border-t border-border">
          <View className="p-4 border-b border-border flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-foreground">
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-primary font-medium">Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView className="max-h-[70%]">
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                className={`p-4 border-b border-border flex-row justify-between items-center ${
                  value === option.value ? "bg-background/50" : ""
                }`}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Text
                  className={`text-base ${
                    value === option.value
                      ? "text-primary font-semibold"
                      : "text-slate-500 dark:text-gray-300"
                  }`}
                >
                  {option.label}
                </Text>
                {value === option.value && (
                  <View className="w-2 h-2 rounded-full bg-primary" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const settingsSchema = z.object({
  display_name: z.string().optional(),
  default_rest_timer: z.string().optional(),
  weight_unit: z.enum(["lbs", "kg"]),
  distance_unit: z.enum(["miles", "km"]),
  timer_pin_enabled: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsScreen() {
  const colors = useThemeColors();
  const { signOut } = useAuth();
  const router = useRouter();
  const headerPadding = useHeaderPadding();
  const bottomPadding = useBottomPadding();
  const { data: userProfile, isLoading } = useUserProfile();
  const updateProfileMutation = useUpdateUserProfile();

  const [isSaving, setIsSaving] = useState(false);

  // Modal state
  const [activeModal, setActiveModal] = useState<
    "restTimer" | "weight" | "distance" | null
  >(null);

  const { control, handleSubmit, reset, setValue, watch, formState } =
    useForm<SettingsFormData>({
      resolver: zodResolver(settingsSchema),
      defaultValues: {
        display_name: "",
        default_rest_timer: "none",
        weight_unit: "lbs",
        distance_unit: "miles",
        timer_pin_enabled: true,
      },
    });

  // Watch values for modal display
  const defaultRestTimer = watch("default_rest_timer");
  const weightUnit = watch("weight_unit");
  const distanceUnit = watch("distance_unit");

  // Populate form
  useEffect(() => {
    if (userProfile) {
      reset({
        display_name: userProfile.display_name || "",
        default_rest_timer:
          userProfile.default_rest_timer?.toString() || "none",
        weight_unit: (userProfile.weight_unit as WeightUnit) || "lbs",
        distance_unit: (userProfile.distance_unit as DistanceUnit) || "miles",
        timer_pin_enabled: userProfile.timer_pin_enabled ?? true,
      });
    }
  }, [userProfile, reset]);

  const onSubmit = async (data: SettingsFormData) => {
    setIsSaving(true);
    try {
      const updates = {
        display_name: data.display_name?.trim() || undefined,
        default_rest_timer:
          data.default_rest_timer && data.default_rest_timer !== "none"
            ? parseInt(data.default_rest_timer)
            : 90, // Default to 90 if something goes wrong, but 'none' should be handled
        weight_unit: data.weight_unit,
        distance_unit: data.distance_unit,
        timer_pin_enabled: data.timer_pin_enabled,
        updated_at: new Date().toISOString(),
      };

      await updateProfileMutation.mutateAsync(updates);
      // Could add toast here
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (userProfile) {
      reset({
        display_name: userProfile.display_name || "",
        default_rest_timer:
          userProfile.default_rest_timer?.toString() || "none",
        weight_unit: (userProfile.weight_unit as WeightUnit) || "lbs",
        distance_unit: (userProfile.distance_unit as DistanceUnit) || "miles",
        timer_pin_enabled: userProfile.timer_pin_enabled ?? true,
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const timerOptions = [
    { label: "No default timer", value: "none" },
    ...TIMER_PRESETS.map((p) => ({
      label: `${p.label} (${p.seconds}s)`,
      value: p.seconds.toString(),
    })),
  ];

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View
          className="flex-1 p-4 pb-0 gap-4"
          style={{
            paddingTop: headerPadding + 16,
            paddingBottom: bottomPadding,
          }}
        >
          {/* Profile Section */}
          <View className="gap-4">
            <Text className="text-lg font-semibold text-foreground ml-1">
              Profile
            </Text>
            <View className="bg-card p-4 rounded-xl border border-border">
              <Text className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-2">
                Display Name
              </Text>
              <Controller
                control={control}
                name="display_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-base text-foreground placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter your display name"
                    placeholderTextColor={colors.textSecondary}
                  />
                )}
              />
              <Text className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                This name will be displayed on your profile
              </Text>
            </View>
          </View>

          {/* Appearance Section */}
          <View className="gap-4">
            <Text className="text-lg font-semibold text-foreground ml-1">
              Appearance
            </Text>
            <ThemeSelector />
          </View>

          {/* Workout Preferences */}
          <View className="gap-4">
            <Text className="text-lg font-semibold text-foreground ml-1">
              Workout preferences
            </Text>
            <View className="bg-card rounded-xl border border-border overflow-hidden">
              {/* Default Rest Timer */}
              <Controller
                control={control}
                name="default_rest_timer"
                render={({ field: { value } }) => (
                  <TouchableOpacity
                    className="p-4 border-b border-border flex-row justify-between items-center bg-card active:bg-slate-50 dark:active:bg-dark-bg/50"
                    onPress={() => setActiveModal("restTimer")}
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-1">
                        Default Rest Timer
                      </Text>
                      <Text className="text-base font-medium text-foreground">
                        {timerOptions.find((o) => o.value === value)?.label ||
                          "Select timer"}
                      </Text>
                    </View>
                    <ChevronDown size={20} color={colors.icon} />
                  </TouchableOpacity>
                )}
              />

              {/* Pin Timer */}
              <View className="p-4 border-b border-border flex-row justify-between items-center bg-card">
                <View className="flex-1 pr-4">
                  <Text className="text-sm font-medium text-foreground">
                    Pin Timer
                  </Text>
                  <Text className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                    Keep the timer visible at the top of the screen when
                    scrolling
                  </Text>
                </View>
                <Controller
                  control={control}
                  name="timer_pin_enabled"
                  render={({ field: { value, onChange } }) => (
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ false: "#cbd5e1", true: "#6366f1" }}
                      thumbColor={Platform.OS === "ios" ? "#fff" : "#fff"}
                    />
                  )}
                />
              </View>

              {/* Units */}
              <View className="flex-row">
                <Controller
                  control={control}
                  name="weight_unit"
                  render={({ field: { value } }) => (
                    <TouchableOpacity
                      className="flex-1 p-4 border-r border-border border-b-0 active:bg-slate-50 dark:active:bg-dark-bg/50"
                      onPress={() => setActiveModal("weight")}
                    >
                      <Text className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-1">
                        Weight Unit
                      </Text>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base font-medium text-foreground">
                          {value === "lbs" ? "Pounds (lbs)" : "Kilograms (kg)"}
                        </Text>
                        <ChevronDown size={16} color={colors.textSecondary} />
                      </View>
                    </TouchableOpacity>
                  )}
                />

                <Controller
                  control={control}
                  name="distance_unit"
                  render={({ field: { value } }) => (
                    <TouchableOpacity
                      className="flex-1 p-4 active:bg-slate-50 dark:active:bg-dark-bg/50 border-b-0"
                      onPress={() => setActiveModal("distance")}
                    >
                      <Text className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-1">
                        Distance Unit
                      </Text>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base font-medium text-foreground">
                          {value === "miles" ? "Miles" : "Kilometers"}
                        </Text>
                        <ChevronDown size={16} color={colors.textSecondary} />
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>

          {/* Actions */}
          <View className="space-y-3 pt-4">
            <View className="flex-row gap-3">
              <Button
                variant="outline"
                onPress={handleReset}
                className="flex-1 bg-card"
                icon={<Undo2 size={20} color={colors.text} />}
              >
                Reset
              </Button>

              <Button
                variant="default"
                onPress={handleSubmit(onSubmit)}
                loading={isSaving}
                className="flex-1"
                icon={<Save size={20} color="white" />}
              >
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </View>

            <Button
              variant="destructive"
              onPress={handleSignOut}
              className="mt-4"
              icon={<LogOut size={20} color="#ef4444" />}
            >
              Sign Out
            </Button>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>

      {/* Modals */}
      <SelectModal
        visible={activeModal === "restTimer"}
        onClose={() => setActiveModal(null)}
        title="Select Default Rest Timer"
        options={timerOptions}
        value={defaultRestTimer || "none"}
        onSelect={(v) =>
          setValue("default_rest_timer", v, { shouldDirty: true })
        }
      />

      <SelectModal
        visible={activeModal === "weight"}
        onClose={() => setActiveModal(null)}
        title="Select Weight Unit"
        options={[
          { label: "Pounds (lbs)", value: "lbs" },
          { label: "Kilograms (kg)", value: "kg" },
        ]}
        value={weightUnit}
        onSelect={(v) =>
          setValue("weight_unit", v as WeightUnit, { shouldDirty: true })
        }
      />

      <SelectModal
        visible={activeModal === "distance"}
        onClose={() => setActiveModal(null)}
        title="Select Distance Unit"
        options={[
          { label: "Miles", value: "miles" },
          { label: "Kilometers", value: "km" },
        ]}
        value={distanceUnit}
        onSelect={(v) =>
          setValue("distance_unit", v as DistanceUnit, { shouldDirty: true })
        }
      />
    </View>
  );
}
