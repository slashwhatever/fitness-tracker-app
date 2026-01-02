import { MovementIcon } from "@/components/MovementIcon";
import { useMuscleGroups, useTrackingTypes } from "@fitness/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateUserMovement } from "@hooks/useMovements";
import { useThemeColors } from "@hooks/useThemeColors";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";

// --- Types & Schema ---

const movementSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tracking_type_id: z.string().min(1, "Tracking type is required"),
  muscle_groups: z.array(z.string()).optional(),
  experience_level: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  instructions: z.string().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

interface CreateCustomMovementFormProps {
  onSuccess: (newMovementId: string) => void;
  onCancel: () => void;
}

// --- Main Component ---

export function CreateCustomMovementForm({
  onSuccess,
  onCancel,
}: CreateCustomMovementFormProps) {
  const themeColors = useThemeColors();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      name: "",
      muscle_groups: [],
      experience_level: "Intermediate",
      // No default tracking type, force user to select
    },
  });

  const { data: trackingTypes = [] } = useTrackingTypes();
  const { data: muscleGroups = [] } = useMuscleGroups();
  const createMutation = useCreateUserMovement();

  // Database enum values for Experience Level
  const experienceLevels = [
    { id: "Beginner", name: "Beginner" },
    { id: "Intermediate", name: "Intermediate" },
    { id: "Advanced", name: "Advanced" },
  ];

  const onSubmit = async (data: MovementFormData) => {
    try {
      const muscleGroupNames = muscleGroups
        .filter((mg) => data.muscle_groups?.includes(mg.id))
        .map((mg) => mg.display_name);

      const newMovement = await createMutation.mutateAsync({
        name: data.name,
        tracking_type_id: data.tracking_type_id,
        experience_level: data.experience_level || "Intermediate",
        personal_notes: data.instructions || null,
        muscle_groups: muscleGroupNames,
      });

      onSuccess(newMovement.id);
    } catch (error) {
      console.error("Failed to create movement:", error);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Name Field */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-2">
            Movement Name <Text className="text-red-500">*</Text>
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-base text-foreground placeholder:text-gray-400 dark:placeholder:text-gray-600"
                value={value}
                onChangeText={onChange}
                placeholder="e.g. Band Pull Aparts"
                placeholderTextColor={themeColors.textSecondary}
              />
            )}
          />
          {errors.name && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.name.message}
            </Text>
          )}
        </View>

        {/* Tracking Type Field */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-2">
            Tracking Type <Text className="text-red-500">*</Text>
          </Text>
          <Controller
            control={control}
            name="tracking_type_id"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row flex-wrap gap-2">
                {trackingTypes.map((type) => {
                  const isSelected = value === type.id;
                  return (
                    <TouchableOpacity
                      key={type.id}
                      onPress={() => onChange(type.id)}
                      className={`flex-row items-center p-2 pr-4 rounded-xl border w-[48%] flex-grow ${
                        isSelected
                          ? "bg-primary-500/10 border-primary-500"
                          : "bg-card border-border"
                      }`}
                    >
                      <View className="h-10 w-10 rounded-full bg-primary-500/20 items-center justify-center mr-3">
                        <MovementIcon trackingType={type.name} size={20} />
                      </View>
                      <Text
                        className={`text-sm font-medium ${
                          isSelected ? "text-primary-500" : "text-foreground"
                        }`}
                      >
                        {type.display_name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          />
          {errors.tracking_type_id && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.tracking_type_id.message}
            </Text>
          )}
        </View>

        {/* Experience Level Field */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-2">
            Experience Level
          </Text>
          <Controller
            control={control}
            name="experience_level"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row gap-2">
                {experienceLevels.map((level) => {
                  const isSelected = value === level.id;
                  return (
                    <TouchableOpacity
                      key={level.id}
                      onPress={() => onChange(level.id)}
                      className={`flex-1 items-center justify-center px-4 py-3 rounded-xl border ${
                        isSelected
                          ? "bg-primary-500/10 border-primary-500"
                          : "bg-card border-border"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          isSelected ? "text-primary-500" : "text-foreground"
                        }`}
                      >
                        {level.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          />
        </View>

        {/* Muscle Groups Field */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-2">
            Muscle Groups (Optional)
          </Text>
          <Controller
            control={control}
            name="muscle_groups"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row flex-wrap gap-2">
                {muscleGroups.map((mg) => {
                  const isSelected = value?.includes(mg.id);
                  return (
                    <TouchableOpacity
                      key={mg.id}
                      onPress={() => {
                        const current = value || [];
                        const newValue = isSelected
                          ? current.filter((id) => id !== mg.id)
                          : [...current, mg.id];
                        onChange(newValue);
                      }}
                      className={`px-4 py-2 rounded-xl border flex-grow items-center justify-center ${
                        isSelected
                          ? "bg-primary-500/10 border-primary-500"
                          : "bg-card border-border"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          isSelected ? "text-primary-500" : "text-foreground"
                        }`}
                      >
                        {mg.display_name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          />
        </View>

        {/* Notes/Instructions Field */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-2">
            Notes / Instructions (Optional)
          </Text>
          <Controller
            control={control}
            name="instructions"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-base text-foreground placeholder:text-gray-400 dark:placeholder:text-gray-600 min-h-[100px]"
                value={value}
                onChangeText={onChange}
                placeholder="e.g. Keep elbows locked..."
                placeholderTextColor={themeColors.textSecondary}
                multiline
                textAlignVertical="top"
              />
            )}
          />
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View className="p-4 border-t border-border bg-card flex-row gap-3">
        <TouchableOpacity
          className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-4 items-center"
          onPress={onCancel}
        >
          <Text className="text-foreground font-semibold text-base">
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-primary-500 rounded-xl p-4 items-center flex-row justify-center gap-2"
          onPress={handleSubmit(onSubmit)}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Create Movement
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
