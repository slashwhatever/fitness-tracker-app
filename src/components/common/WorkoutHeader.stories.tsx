import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import WorkoutHeader from './WorkoutHeader';
import { Workout } from '@/models/types';

const meta: Meta<typeof WorkoutHeader> = {
  title: 'Components/WorkoutHeader',
  component: WorkoutHeader,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    onAddMovement: { action: 'add movement clicked' },
    onSettings: { action: 'settings clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockWorkout: Workout = {
  id: '1',
  name: 'Upper/Lower Day 4',
  description: 'Focus on upper body strength and lower body power',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  user_id: 'user-1',
  default_rest_timer: null,
};

export const Loading: Story = {
  args: {
    isLoading: true,
    movementCount: 0,
    onAddMovement: () => {},
    onSettings: () => {},
  },
};

export const WithWorkout: Story = {
  args: {
    workout: mockWorkout,
    isLoading: false,
    movementCount: 7,
    onAddMovement: () => {},
    onSettings: () => {},
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
    onAddMovement: () => {},
    onSettings: () => {},
  },
};

export const SingleMovement: Story = {
  args: {
    workout: {
      ...mockWorkout,
      name: 'Quick Bench Session',
      description: null,
    },
    isLoading: false,
    movementCount: 1,
    onAddMovement: () => {},
    onSettings: () => {},
  },
};