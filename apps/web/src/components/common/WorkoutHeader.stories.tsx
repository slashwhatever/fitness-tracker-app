import { Workout } from "@fitness/shared";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import WorkoutHeader from "./WorkoutHeader";

const meta: Meta<typeof WorkoutHeader> = {
  title: "Components/WorkoutHeader",
  component: WorkoutHeader,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockWorkout: Workout = {
  id: "1",
  name: "Upper/Lower Day 4",
  description: "Focus on upper body strength and lower body power",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  user_id: "user-1",
  default_rest_timer: null,
  archived: false,
  group_id: null,
  order_index: 0,
};

export const Loading: Story = {
  args: {
    isLoading: true,
    movementCount: 0,
  },
};

export const WithWorkout: Story = {
  args: {
    workout: mockWorkout,
    isLoading: false,
    movementCount: 7,
  },
};

export const WithWorkoutNoDescription: Story = {
  args: {
    workout: {
      ...mockWorkout,
      description: null,
    },
    isLoading: false,
    movementCount: 3,
  },
};

export const SingleMovement: Story = {
  args: {
    workout: {
      ...mockWorkout,
      name: "Quick Bench Session",
      description: null,
    },
    isLoading: false,
    movementCount: 1,
  },
};
