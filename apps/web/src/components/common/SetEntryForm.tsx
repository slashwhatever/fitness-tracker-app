"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { Set, UserMovement } from "@fitness/shared";
import { Check, Minus, Plus } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";

// Zod schema for form validation (used for type inference)
type SetEntryFormData = {
  reps: number | null;
  weight: number | null;
  duration: number | null;
  distance: number | null;
  notes: string;
};

interface SetEntryFormProps {
  movement: UserMovement;
  initialData?: Partial<Set>;
  onSave: (data: Partial<Set>) => Promise<void>;
  isLoading?: boolean;
  saveButtonText?: string;
}

export default function SetEntryForm({
  movement,
  initialData = {},
  onSave,
  isLoading = false,
  saveButtonText = "Save Set",
}: SetEntryFormProps) {
  const { data: userProfile } = useUserProfile();

  const { watch, setValue, handleSubmit, reset } = useForm<SetEntryFormData>({
    defaultValues: {
      reps: initialData.reps || null,
      weight: initialData.weight || null,
      duration: initialData.duration || null,
      distance: initialData.distance || null,
      notes: initialData.notes || "",
    },
    mode: "onChange",
  });

  const formValues = watch();

  // Update form when initialData changes (for navigation between movements)
  useEffect(() => {
    reset({
      reps: initialData.reps || null,
      weight: initialData.weight || null,
      duration: initialData.duration || null,
      distance: initialData.distance || null,
      notes: initialData.notes || "",
    });
  }, [
    reset,
    initialData.reps,
    initialData.weight,
    initialData.duration,
    initialData.distance,
    initialData.notes,
  ]);

  const weightUnit = userProfile?.weight_unit || "lbs";
  const distanceUnit = userProfile?.distance_unit || "miles";

  const getDistanceUnitAbbreviation = (unit: string) => {
    return unit === "miles" ? "mi" : "km";
  };

  const adjustValue = useCallback(
    (field: "reps" | "weight" | "duration" | "distance", delta: number) => {
      const currentValue = formValues[field] || 0;
      const newValue = Math.max(0, currentValue + delta);
      setValue(field, newValue || null);
    },
    [formValues, setValue]
  );

  const handleInputChange = useCallback(
    (
      field: "reps" | "weight" | "duration" | "distance" | "notes",
      value: string
    ) => {
      if (field === "notes") {
        setValue(field, value);
      } else {
        const numValue =
          value === ""
            ? null
            : field === "reps" || field === "duration"
              ? parseInt(value) || null
              : parseFloat(value) || null;
        setValue(field, numValue);
      }
    },
    [setValue]
  );

  // Memoized event handlers to prevent input focus loss
  const handleRepsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange("reps", e.target.value);
    },
    [handleInputChange]
  );

  const handleWeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange("weight", e.target.value);
    },
    [handleInputChange]
  );

  const handleDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange("duration", e.target.value);
    },
    [handleInputChange]
  );

  const handleDistanceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange("distance", e.target.value);
    },
    [handleInputChange]
  );

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange("notes", e.target.value);
    },
    [handleInputChange]
  );

  // Focus handlers to select all text for easy overwriting
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  }, []);

  const isFormValid = (): boolean => {
    if (!movement) return false;

    switch (movement.tracking_type) {
      case "weight":
      case "bodyweight":
        return (
          formValues.reps !== null &&
          formValues.reps !== undefined &&
          formValues.reps > 0
        );
      case "duration":
        return (
          formValues.duration !== null &&
          formValues.duration !== undefined &&
          formValues.duration > 0
        );
      case "distance":
        return (
          formValues.distance !== null &&
          formValues.distance !== undefined &&
          formValues.distance > 0
        );
      case "reps":
        return (
          formValues.reps !== null &&
          formValues.reps !== undefined &&
          formValues.reps > 0
        );
      default:
        return false;
    }
  };

  const onSubmit = handleSubmit(async (data: SetEntryFormData) => {
    await onSave(data);
  });

  return (
    <div className="p-4">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Reps and Weight Display */}
        {(movement.tracking_type === "weight" ||
          movement.tracking_type === "bodyweight" ||
          movement.tracking_type === "reps") && (
          <div
            className={`grid gap-4 ${
              movement.tracking_type === "weight"
                ? "grid-cols-2"
                : "grid-cols-1 max-w-sm mx-auto"
            }`}
          >
            {/* Reps */}
            <div className="space-y-2">
              <div className="text-center">
                <Input
                  type="number"
                  inputMode="numeric"
                  value={formValues.reps || ""}
                  onChange={handleRepsChange}
                  onFocus={handleFocus}
                  className="text-5xl font-light text-center bg-transparent border-none shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  min="0"
                  placeholder="0"
                  style={{
                    fontSize: "3rem",
                    lineHeight: "1",
                    border: "none !important",
                    outline: "none !important",
                    boxShadow: "none !important",
                  }}
                />
                <div className="text-base text-muted-foreground">
                  rep{(formValues.reps || 0) !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="flex justify-center items-center space-x-4 h-16">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustValue("reps", -1)}
                  className="h-12 w-12 rounded-full outline-1 outline-offset-2 outline-solid outline-gray-800"
                  aria-label="Decrease reps by 1"
                >
                  <Minus className="h-6 w-6" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustValue("reps", 1)}
                  className="h-12 w-12 rounded-full outline-1 outline-offset-2 outline-solid outline-gray-800"
                  aria-label="Increase reps by 1"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Weight (only for weight tracking) */}
            {movement.tracking_type === "weight" && (
              <div className="space-y-2">
                <div className="text-center">
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={formValues.weight || ""}
                    onChange={handleWeightChange}
                    onFocus={handleFocus}
                    className="text-5xl font-light text-center bg-transparent border-none shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    min="0"
                    step="any"
                    placeholder="0"
                    style={{
                      fontSize: "3rem",
                      lineHeight: "1",
                      border: "none !important",
                      outline: "none !important",
                      boxShadow: "none !important",
                    }}
                  />
                  <div className="text-base text-muted-foreground">
                    {weightUnit}
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center space-y-2">
                  <div className="grid grid-cols-3 gap-0 w-28 h-8">
                    <div className="flex justify-center items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => adjustValue("weight", -1)}
                        className="h-6 w-6 rounded-full outline-1 outline-offset-2 outline-solid outline-gray-800"
                        aria-label="Decrease weight by 1"
                      >
                        <Minus className="h-6 w-6" />
                      </Button>
                    </div>
                    <div className="flex justify-center items-center text-base text-muted-foreground">
                      1
                    </div>
                    <div className="flex justify-center items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => adjustValue("weight", 1)}
                        className="h-6 w-6 rounded-full outline-1 outline-offset-2 outline-solid outline-gray-800"
                        aria-label="Increase weight by 1"
                      >
                        <Plus className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-0 w-28 h-8">
                    <div className="flex justify-center items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => adjustValue("weight", -5)}
                        className="h-6 w-6 rounded-full outline-1 outline-offset-2 outline-solid outline-gray-800"
                        aria-label="Decrease weight by 5"
                      >
                        <Minus className="h-6 w-6" />
                      </Button>
                    </div>
                    <div className="flex justify-center items-center text-base text-muted-foreground">
                      5
                    </div>
                    <div className="flex justify-center items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => adjustValue("weight", 5)}
                        className="h-6 w-6 rounded-full outline-1 outline-offset-2 outline-solid outline-gray-800"
                        aria-label="Increase weight by 5"
                      >
                        <Plus className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Duration Display */}
        {movement.tracking_type === "duration" && (
          <div className="space-y-2 max-w-sm mx-auto">
            <div className="text-center">
              <Input
                type="number"
                inputMode="numeric"
                value={formValues.duration || ""}
                onChange={handleDurationChange}
                onFocus={handleFocus}
                className="text-5xl font-light text-center bg-transparent border-none shadow-none focus:ring-0 focus:ring-offset-0 p-0 h-auto w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                min="0"
                placeholder="0"
                style={{ fontSize: "3rem", lineHeight: "1" }}
              />
              <div className="text-base text-muted-foreground">seconds</div>
            </div>
            <div className="flex justify-center items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustValue("duration", -5)}
                className="h-12 w-12 rounded-full"
                aria-label="Decrease duration by 5 seconds"
              >
                <Minus className="h-6 w-6" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustValue("duration", 5)}
                className="h-12 w-12 rounded-full"
                aria-label="Increase duration by 5 seconds"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>
        )}

        {/* Distance Display */}
        {movement.tracking_type === "distance" && (
          <div className="space-y-2 max-w-sm mx-auto">
            <div className="text-center">
              <Input
                type="number"
                inputMode="decimal"
                value={formValues.distance || ""}
                onChange={handleDistanceChange}
                onFocus={handleFocus}
                className="text-5xl font-light text-center bg-transparent border-none shadow-none focus:ring-0 focus:ring-offset-0 p-0 h-auto w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                min="0"
                step="0.1"
                placeholder="0"
                style={{ fontSize: "3rem", lineHeight: "1" }}
              />
              <div className="text-base text-muted-foreground">
                {getDistanceUnitAbbreviation(distanceUnit)}
              </div>
            </div>
            <div className="flex justify-center items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustValue("distance", -0.1)}
                className="h-12 w-12 rounded-full"
                aria-label="Decrease distance by 0.1"
              >
                <Minus className="h-6 w-6" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustValue("distance", 0.1)}
                className="h-12 w-12 rounded-full"
                aria-label="Increase distance by 0.1"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button
          type="submit"
          disabled={isLoading || !isFormValid()}
          className="w-full h-10 rounded-full bg-green-600 hover:bg-green-700 text-white text-base"
        >
          {isLoading ? (
            <span>Saving...</span>
          ) : (
            <>
              <Check className="h-6 w-6 mr-2" />
              {saveButtonText}
            </>
          )}
        </Button>

        {/* Notes */}
        <div className="space-y-2">
          <Input
            type="text"
            value={formValues.notes || ""}
            onChange={handleNotesChange}
            onFocus={handleFocus}
            placeholder="Add note"
            className="text-center text-sm sm:text-base bg-transparent border-0 border-b border-muted-foreground/30 rounded-none focus:border-primary focus:ring-0"
          />
        </div>
      </form>
    </div>
  );
}
