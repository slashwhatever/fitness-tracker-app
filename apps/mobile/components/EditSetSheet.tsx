import { Tables } from "@fitness/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateSet } from "@hooks/useSets";
import { useThemeColors } from "@hooks/useThemeColors";
import { Check } from "lucide-react-native";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { z } from "zod";
import { SetAdjuster } from "./SetAdjuster";

type Set = Tables<"sets">;

interface EditSetSheetProps {
  visible: boolean;
  onClose: () => void;
  set: Set | null;
  trackingType?: string;
  weightUnit?: string;
  distanceUnit?: string;
}

const formSchema = z
  .object({
    reps: z.string(),
    weight: z.string(),
    distance: z.string(),
    duration: z.string(),
    notes: z.string().optional(),
    trackingType: z.string(),
  })
  .superRefine((data, ctx) => {
    const repsVal = parseInt(data.reps) || 0;
    const distanceVal = parseFloat(data.distance) || 0;
    const durationVal = parseInt(data.duration) || 0;

    if (
      ["weight", "bodyweight", "reps"].includes(data.trackingType) &&
      repsVal <= 0
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Reps must be greater than 0",
        path: ["reps"],
      });
    }

    if (data.trackingType === "distance" && distanceVal <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Distance must be greater than 0",
        path: ["distance"],
      });
    }

    if (data.trackingType === "duration" && durationVal <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Duration must be greater than 0",
        path: ["duration"],
      });
    }
  });

type FormData = z.infer<typeof formSchema>;

export function EditSetSheet({
  visible,
  onClose,
  set,
  trackingType = "weight",
  weightUnit = "kg",
  distanceUnit = "km",
}: EditSetSheetProps) {
  const colors = useThemeColors();
  const updateSetMutation = useUpdateSet();

  const { control, handleSubmit, reset, formState } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reps: "0",
      weight: "0",
      distance: "0",
      duration: "0",
      notes: "",
      trackingType: trackingType,
    },
  });

  useEffect(() => {
    if (set && visible) {
      reset({
        reps: set.reps?.toString() || "0",
        weight: set.weight?.toString() || "0",
        distance: set.distance?.toString() || "0",
        duration: set.duration?.toString() || "0",
        notes: set.notes || "",
        trackingType: trackingType,
      });
    }
  }, [set, visible, trackingType, reset]);

  const onSubmit = async (data: FormData) => {
    if (!set) return;

    try {
      const repsVal = parseInt(data.reps);
      const weightVal = parseFloat(data.weight);
      const distanceVal = parseFloat(data.distance);
      const durationVal = parseInt(data.duration);

      // Determine which fields should be sent based on tracking type
      // Send null for fields not applicable to this tracking type to avoid constraint violations
      const shouldIncludeReps = ["weight", "bodyweight", "reps"].includes(
        data.trackingType
      );
      const shouldIncludeWeight = data.trackingType === "weight";
      const shouldIncludeDistance = data.trackingType === "distance";
      const shouldIncludeDuration = data.trackingType === "duration";

      await updateSetMutation.mutateAsync({
        id: set.id,
        updates: {
          reps:
            shouldIncludeReps && !isNaN(repsVal) && repsVal > 0
              ? repsVal
              : null,
          weight: shouldIncludeWeight && !isNaN(weightVal) ? weightVal : null,
          distance:
            shouldIncludeDistance && !isNaN(distanceVal) && distanceVal > 0
              ? distanceVal
              : null,
          duration:
            shouldIncludeDuration && !isNaN(durationVal) && durationVal > 0
              ? durationVal
              : null,
          notes: data.notes?.trim() || undefined,
        },
      });
      onClose();
    } catch (error) {
      console.error("Failed to update set:", error);
    }
  };

  const handleAdjust = (
    setter: (val: string) => void,
    current: string,
    delta: number
  ) => {
    const val = parseFloat(current) || 0;
    const newVal = Math.max(0, val + delta);
    setter(newVal % 1 === 0 ? newVal.toString() : newVal.toFixed(1));
  };

  if (!set) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View className="bg-card rounded-t-3xl border-t border-border p-6 pb-12">
              {/* Handle bar */}
              <View className="items-center mb-6">
                <View className="w-12 h-1 bg-gray-600 rounded-full" />
              </View>

              {/* Header */}
              <View className="items-center mb-8">
                <Text className="text-foreground text-xl font-bold mb-1">
                  Edit set
                </Text>
                <Text className="text-slate-500 dark:text-gray-400 text-sm max-w-[80%] text-center">
                  Modify the values for this set from{" "}
                  {new Date(set.created_at).toLocaleString()}
                </Text>
              </View>

              {/* Inputs */}
              <View className="flex-row justify-center gap-4 mb-8">
                {(trackingType === "weight" ||
                  trackingType === "reps" ||
                  trackingType === "bodyweight") && (
                  <View className="flex-1">
                    <Controller
                      control={control}
                      name="reps"
                      render={({ field: { onChange, value } }) => (
                        <SetAdjuster
                          label="reps"
                          value={value}
                          onChangeText={onChange}
                          onAdjust={(delta) =>
                            handleAdjust(onChange, value, delta)
                          }
                          steps={[1]}
                          variant="primary"
                        />
                      )}
                    />
                  </View>
                )}

                {trackingType === "weight" && (
                  <View className="flex-1">
                    <Controller
                      control={control}
                      name="weight"
                      render={({ field: { onChange, value } }) => (
                        <SetAdjuster
                          label={weightUnit}
                          value={value}
                          onChangeText={onChange}
                          onAdjust={(delta) =>
                            handleAdjust(onChange, value, delta)
                          }
                          steps={[1, 5]}
                          variant="secondary"
                        />
                      )}
                    />
                  </View>
                )}

                {trackingType === "duration" && (
                  <View className="flex-1">
                    <Controller
                      control={control}
                      name="duration"
                      render={({ field: { onChange, value } }) => (
                        <SetAdjuster
                          label="seconds"
                          value={value}
                          onChangeText={onChange}
                          onAdjust={(delta) =>
                            handleAdjust(onChange, value, delta)
                          }
                          steps={[5, 15]}
                          variant="primary"
                        />
                      )}
                    />
                  </View>
                )}

                {trackingType === "distance" && (
                  <View className="flex-1">
                    <Controller
                      control={control}
                      name="distance"
                      render={({ field: { onChange, value } }) => (
                        <SetAdjuster
                          label={distanceUnit}
                          value={value}
                          onChangeText={onChange}
                          onAdjust={(delta) =>
                            handleAdjust(onChange, value, delta)
                          }
                          steps={[0.1, 0.5]}
                          variant="primary"
                        />
                      )}
                    />
                  </View>
                )}
              </View>

              {/* Validation Error Message */}
              {!formState.isValid && formState.isSubmitted && (
                <View className="mb-4 items-center">
                  {Object.keys(formState.errors).map((key) => (
                    <Text key={key} className="text-red-500 font-medium">
                      {formState.errors[key as keyof FormData]?.message}
                    </Text>
                  ))}
                </View>
              )}

              {/* Save Button */}
              <TouchableOpacity
                className={`bg-green-600 rounded-full py-4 items-center flex-row justify-center gap-2 active:bg-green-700 mb-6 ${
                  !formState.isValid ? "opacity-50" : ""
                }`}
                onPress={handleSubmit(onSubmit)}
                disabled={updateSetMutation.isPending || !formState.isValid}
              >
                {updateSetMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Check size={24} color="white" />
                    <Text className="text-white text-lg font-bold">
                      Save Changes
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Notes */}
              <View className="bg-slate-100 dark:bg-slate-800 rounded-xl border border-border p-3 flex-row items-center justify-between">
                <Controller
                  control={control}
                  name="notes"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="Add note"
                      placeholderTextColor={colors.textSecondary}
                      className="text-foreground text-base flex-1"
                      value={value ?? ""}
                      onChangeText={onChange}
                      multiline
                    />
                  )}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
