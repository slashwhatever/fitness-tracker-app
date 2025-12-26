import {
  DistanceUnit,
  TIMER_PRESETS,
  WeightUnit,
  useAuth,
  useUpdateUserProfile,
  useUserProfile,
} from "@fitness/shared";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { ThemeSelector } from "../../components/ThemeSelector";
import { useBottomPadding } from "../../hooks/useBottomPadding";
import { useHeaderPadding } from "../../hooks/useHeaderPadding";

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
        <View className="bg-white dark:bg-dark-card rounded-t-3xl overflow-hidden pb-8 border-t border-slate-200 dark:border-dark-border">
          <View className="p-4 border-b border-slate-200 dark:border-dark-border flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-slate-900 dark:text-white">
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
                className={`p-4 border-b border-slate-200 dark:border-dark-border flex-row justify-between items-center ${
                  value === option.value ? "bg-slate-50 dark:bg-dark-bg/50" : ""
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
      <View className="flex-1 justify-center items-center bg-slate-50 dark:bg-dark-bg">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-dark-bg">
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
            <Text className="text-lg font-semibold text-slate-900 dark:text-white ml-1">
              Profile
            </Text>
            <View className="bg-white dark:bg-dark-card p-4 rounded-xl border border-slate-200 dark:border-dark-border">
              <Text className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-2">
                Display Name
              </Text>
              <Controller
                control={control}
                name="display_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="w-full bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-lg px-4 py-3 text-base text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter your display name"
                    placeholderTextColor="#94a3b8"
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
            <Text className="text-lg font-semibold text-slate-900 dark:text-white ml-1">
              Appearance
            </Text>
            <ThemeSelector />
          </View>

          {/* Workout Preferences */}
          <View className="gap-4">
            <Text className="text-lg font-semibold text-slate-900 dark:text-white ml-1">
              Workout preferences
            </Text>
            <View className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border overflow-hidden">
              {/* Default Rest Timer */}
              <Controller
                control={control}
                name="default_rest_timer"
                render={({ field: { value } }) => (
                  <TouchableOpacity
                    className="p-4 border-b border-slate-200 dark:border-dark-border flex-row justify-between items-center bg-white dark:bg-dark-card active:bg-slate-50 dark:active:bg-dark-bg/50"
                    onPress={() => setActiveModal("restTimer")}
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-1">
                        Default Rest Timer
                      </Text>
                      <Text className="text-base font-medium text-slate-900 dark:text-white">
                        {timerOptions.find((o) => o.value === value)?.label ||
                          "Select timer"}
                      </Text>
                    </View>
                    <ChevronDown
                      size={20}
                      className="text-slate-400 dark:text-gray-500"
                    />
                  </TouchableOpacity>
                )}
              />

              {/* Pin Timer */}
              <View className="p-4 border-b border-slate-200 dark:border-dark-border flex-row justify-between items-center bg-white dark:bg-dark-card">
                <View className="flex-1 pr-4">
                  <Text className="text-sm font-medium text-slate-900 dark:text-white">
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
                      className="flex-1 p-4 border-r border-slate-200 dark:border-dark-border border-b-0 active:bg-slate-50 dark:active:bg-dark-bg/50"
                      onPress={() => setActiveModal("weight")}
                    >
                      <Text className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-1">
                        Weight Unit
                      </Text>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base font-medium text-slate-900 dark:text-white">
                          {value === "lbs" ? "Pounds (lbs)" : "Kilograms (kg)"}
                        </Text>
                        <ChevronDown
                          size={16}
                          className="text-slate-400 dark:text-gray-500"
                        />
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
                        <Text className="text-base font-medium text-slate-900 dark:text-white">
                          {value === "miles" ? "Miles" : "Kilometers"}
                        </Text>
                        <ChevronDown
                          size={16}
                          className="text-slate-400 dark:text-gray-500"
                        />
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
              <TouchableOpacity
                onPress={handleReset}
                className="flex-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-4 rounded-xl flex-row justify-center items-center active:bg-slate-50 dark:active:bg-dark-bg/50 "
              >
                <Undo2
                  size={20}
                  className="text-slate-900 dark:text-white mr-2"
                />
                <Text className="font-semibold text-slate-900 dark:text-white">
                  Reset
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={isSaving}
                className={`flex-1 bg-primary p-4 rounded-xl flex-row justify-center items-center ${
                  isSaving ? "opacity-70" : "active:opacity-90"
                }`}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" className="mr-2" />
                ) : (
                  <Save size={20} color="white" className="mr-2" />
                )}
                <Text className="font-semibold text-white">
                  {isSaving ? "Saving..." : "Save changes"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleSignOut}
              className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 flex-row justify-center items-center active:bg-red-500/20 mt-4"
            >
              <LogOut size={20} className="text-red-500 mr-2" />
              <Text className="text-red-500 font-semibold">Sign Out</Text>
            </TouchableOpacity>
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
