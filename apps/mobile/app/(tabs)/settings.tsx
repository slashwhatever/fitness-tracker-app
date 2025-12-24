import {
  DistanceUnit,
  TIMER_PRESETS,
  WeightUnit,
  useAuth,
  useUpdateUserProfile,
  useUserProfile,
} from "@fitness/shared";
import { useRouter } from "expo-router";
import { ChevronDown, LogOut, Save, Undo2 } from "lucide-react-native";
import { useEffect, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";

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
        <View className="bg-dark-card rounded-t-3xl overflow-hidden pb-8 border-t border-dark-border">
          <View className="p-4 border-b border-dark-border flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-white">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-primary font-medium">Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView className="max-h-[70%]">
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                className={`p-4 border-b border-dark-border flex-row justify-between items-center ${
                  value === option.value ? "bg-dark-bg/50" : ""
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
                      : "text-gray-300"
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

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const { data: userProfile, isLoading } = useUserProfile();
  const updateProfileMutation = useUpdateUserProfile();

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [defaultRestTimer, setDefaultRestTimer] = useState("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("lbs");
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>("miles");
  const [timerPinEnabled, setTimerPinEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modal state
  const [activeModal, setActiveModal] = useState<
    "restTimer" | "weight" | "distance" | null
  >(null);

  // Populate form
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.display_name || "");
      setDefaultRestTimer(userProfile.default_rest_timer?.toString() || "none");
      setWeightUnit((userProfile.weight_unit as WeightUnit) || "lbs");
      setDistanceUnit((userProfile.distance_unit as DistanceUnit) || "miles");
      setTimerPinEnabled(userProfile.timer_pin_enabled ?? true);
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!userProfile) return;

    setIsSaving(true);
    try {
      const updates = {
        display_name: displayName.trim() || undefined,
        default_rest_timer:
          defaultRestTimer && defaultRestTimer !== "none"
            ? parseInt(defaultRestTimer)
            : 90,
        weight_unit: weightUnit,
        distance_unit: distanceUnit,
        timer_pin_enabled: timerPinEnabled,
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
      setDisplayName(userProfile.display_name || "");
      setDefaultRestTimer(userProfile.default_rest_timer?.toString() || "none");
      setWeightUnit((userProfile.weight_unit as WeightUnit) || "lbs");
      setDistanceUnit((userProfile.distance_unit as DistanceUnit) || "miles");
      setTimerPinEnabled(userProfile.timer_pin_enabled ?? true);
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
      <View className="flex-1 justify-center items-center bg-dark-bg">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-bg">
      <ScrollView className="flex-1">
        <View className="flex-1 p-4 pb-0 gap-4">
          <Text className="text-3xl font-bold text-white">Settings</Text>

          {/* Profile Section */}
          <View className="gap-4">
            <Text className="text-lg font-semibold text-white ml-1">
              Profile
            </Text>
            <View className="bg-dark-card p-4 rounded-xl border border-dark-border">
              <Text className="text-sm font-medium text-gray-400 mb-2">
                Display Name
              </Text>
              <TextInput
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-base text-white placeholder:text-gray-600"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your display name"
                placeholderTextColor="#64748b"
              />
              <Text className="text-xs text-gray-500 mt-2">
                This name will be displayed on your profile
              </Text>
            </View>
          </View>

          {/* Workout Preferences */}
          <View className="gap-4">
            <Text className="text-lg font-semibold text-white ml-1">
              Workout preferences
            </Text>
            <View className="bg-dark-card rounded-xl border border-dark-border overflow-hidden">
              {/* Default Rest Timer */}
              <TouchableOpacity
                className="p-4 border-b border-dark-border flex-row justify-between items-center bg-dark-card active:bg-dark-bg/50"
                onPress={() => setActiveModal("restTimer")}
              >
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-400 mb-1">
                    Default Rest Timer
                  </Text>
                  <Text className="text-base font-medium text-white">
                    {timerOptions.find((o) => o.value === defaultRestTimer)
                      ?.label || "Select timer"}
                  </Text>
                </View>
                <ChevronDown size={20} className="text-gray-500" />
              </TouchableOpacity>

              {/* Pin Timer */}
              <View className="p-4 border-b border-dark-border flex-row justify-between items-center bg-dark-card">
                <View className="flex-1 pr-4">
                  <Text className="text-sm font-medium text-white">
                    Pin Timer
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    Keep the timer visible at the top of the screen when
                    scrolling
                  </Text>
                </View>
                <Switch
                  value={timerPinEnabled}
                  onValueChange={setTimerPinEnabled}
                  trackColor={{ false: "#334155", true: "#6366f1" }}
                  thumbColor={Platform.OS === "ios" ? "#fff" : "#fff"}
                />
              </View>

              {/* Units */}
              <View className="flex-row">
                <TouchableOpacity
                  className="flex-1 p-4 border-r border-dark-border border-b-0 active:bg-dark-bg/50"
                  onPress={() => setActiveModal("weight")}
                >
                  <Text className="text-sm font-medium text-gray-400 mb-1">
                    Weight Unit
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-medium text-white">
                      {weightUnit === "lbs" ? "Pounds (lbs)" : "Kilograms (kg)"}
                    </Text>
                    <ChevronDown size={16} className="text-gray-500" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 p-4 active:bg-dark-bg/50 border-b-0"
                  onPress={() => setActiveModal("distance")}
                >
                  <Text className="text-sm font-medium text-gray-400 mb-1">
                    Distance Unit
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-medium text-white">
                      {distanceUnit === "miles" ? "Miles" : "Kilometers"}
                    </Text>
                    <ChevronDown size={16} className="text-gray-500" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View className="space-y-3 pt-4">
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleReset}
                className="flex-1 bg-dark-card border border-dark-border p-4 rounded-xl flex-row justify-center items-center active:bg-dark-bg/50 "
              >
                <Undo2 size={20} color="white" className="mr-2" />
                <Text className="font-semibold text-white">Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
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
        value={defaultRestTimer}
        onSelect={setDefaultRestTimer}
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
        onSelect={(v) => setWeightUnit(v as WeightUnit)}
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
        onSelect={(v) => setDistanceUnit(v as DistanceUnit)}
      />
    </SafeAreaView>
  );
}
