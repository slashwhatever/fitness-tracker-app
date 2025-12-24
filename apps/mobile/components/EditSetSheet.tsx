import { Tables } from "@fitness/shared";
import { useUpdateSet } from "@fitness/shared/src/hooks/useSets";
import { Check } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SetAdjuster } from "./SetAdjuster";

type Set = Tables<"sets">;

interface EditSetSheetProps {
  visible: boolean;
  onClose: () => void;
  set: Set | null;
}

export function EditSetSheet({ visible, onClose, set }: EditSetSheetProps) {
  const [reps, setReps] = useState("0");
  const [weight, setWeight] = useState("0");
  const [notes, setNotes] = useState("");

  const updateSetMutation = useUpdateSet();

  useEffect(() => {
    if (set && visible) {
      setReps(set.reps?.toString() || "0");
      setWeight(set.weight?.toString() || "0");
      setNotes(set.notes || "");
    }
  }, [set, visible]);

  const handleSave = async () => {
    if (!set) return;

    try {
      await updateSetMutation.mutateAsync({
        id: set.id,
        updates: {
          reps: parseInt(reps) || 0,
          weight: parseFloat(weight) || 0,
          notes: notes.trim() || undefined,
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
    setter(Math.max(0, val + delta).toString());
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
            <View className="bg-dark-card rounded-t-3xl border-t border-dark-border p-6 pb-12">
              {/* Handle bar */}
              <View className="items-center mb-6">
                <View className="w-12 h-1 bg-gray-600 rounded-full" />
              </View>

              {/* Header */}
              <View className="items-center mb-8">
                <Text className="text-white text-xl font-bold mb-1">
                  Edit set
                </Text>
                <Text className="text-gray-400 text-sm max-w-[80%] text-center">
                  Modify the values for this set from{" "}
                  {new Date(set.created_at).toLocaleString()}
                </Text>
              </View>

              {/* Inputs */}
              <View className="flex-row justify-center gap-12 mb-8">
                <SetAdjuster
                  label="reps"
                  value={reps}
                  onChangeText={setReps}
                  onIncrement={() => handleAdjust(setReps, reps, 1)}
                  onDecrement={() => handleAdjust(setReps, reps, -1)}
                />
                <SetAdjuster
                  label="kg"
                  value={weight}
                  onChangeText={setWeight}
                  onIncrement={() => handleAdjust(setWeight, weight, 5)}
                  onDecrement={() => handleAdjust(setWeight, weight, -5)}
                  incrementValue={5}
                  decrementValue={5}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                className="bg-green-600 rounded-full py-4 items-center flex-row justify-center gap-2 active:bg-green-700 mb-6"
                onPress={handleSave}
                disabled={updateSetMutation.isPending}
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
              <View className="bg-dark-bg/50 rounded-xl border border-dark-border p-3 flex-row items-center justify-between">
                <TextInput
                  placeholder="Add note"
                  placeholderTextColor="#64748b"
                  className="text-white text-base flex-1"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                />
                {/* Note Icon/Button Placeholder if needed */}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
