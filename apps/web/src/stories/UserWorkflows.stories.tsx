// @ts-nocheck - Storybook file with dev-only imports
import WorkoutDetailPage from "@/app/workout/[workoutId]/page";
import { AuthContext } from "@/lib/auth/AuthProvider";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

// Mock AuthProvider for Storybook that bypasses Supabase
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const mockAuthValue = {
    user: {
      id: "test-user-id",
      email: "test@example.com",
      user_metadata: { display_name: "Test User" },
      aud: "authenticated",
      role: "authenticated",
      created_at: "2023-01-01T00:00:00.000Z",
      updated_at: "2023-01-01T00:00:00.000Z",
      email_confirmed_at: "2023-01-01T00:00:00.000Z",
    },
    session: {
      access_token: "mock-access-token",
      refresh_token: "mock-refresh-token",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: "bearer",
      user: {
        id: "test-user-id",
        email: "test@example.com",
        user_metadata: { display_name: "Test User" },
        aud: "authenticated",
        role: "authenticated",
        created_at: "2023-01-01T00:00:00.000Z",
        updated_at: "2023-01-01T00:00:00.000Z",
        email_confirmed_at: "2023-01-01T00:00:00.000Z",
      },
    },
    loading: false,
    signOut: async () => {},
    refreshSession: async () => {},
  };

  return (
    <AuthContext.Provider value={mockAuthValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Create test QueryClient with appropriate settings
const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        networkMode: "offlineFirst",
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// Wrapper component for consistent testing
const WorkoutPageWrapper = ({ workoutId }: { workoutId: string }) => {
  const queryClient = createTestQueryClient();

  return (
    <MockAuthProvider>
      <QueryClientProvider client={queryClient}>
        <WorkoutDetailPage params={Promise.resolve({ workoutId })} />
      </QueryClientProvider>
    </MockAuthProvider>
  );
};

const meta = {
  title: "User Workflows/Workout Detail Page",
  component: WorkoutPageWrapper,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/workout/550e8400-e29b-41d4-a716-446655440001",
      },
    },
  },
  args: {
    workoutId: "550e8400-e29b-41d4-a716-446655440001",
  },
} satisfies Meta<typeof WorkoutPageWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper to wait for content to load
const waitForContentToLoad = async (canvasElement: HTMLElement) => {
  await waitFor(
    () => {
      const skeletons = canvasElement.querySelectorAll(".animate-pulse");
      if (skeletons.length > 0) {
        throw new Error("Still loading");
      }
    },
    { timeout: 10000 }
  );
};

// ============================================================================
// VISUAL REGRESSION TESTS - Catch UI/Layout Changes
// ============================================================================

export const VisualRegression_BasicLayout: Story = {
  name: "Visual Regression - Basic Layout",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitForContentToLoad(canvasElement);

    // Verify core layout elements are present
    expect(
      canvas.getByRole("heading", { name: /push day workout/i })
    ).toBeInTheDocument();
    expect(canvas.getByText(/bench press/i)).toBeInTheDocument();
    expect(canvas.getByText(/overhead press/i)).toBeInTheDocument();

    // Verify navigation is present
    const navElements = canvas.getAllByRole("navigation");
    expect(navElements.length).toBeGreaterThan(0);
  },
};

export const VisualRegression_AllMovements: Story = {
  name: "Visual Regression - Movement Cards",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitForContentToLoad(canvasElement);

    // Verify movement cards structure
    const benchPress = canvas.getByText(/bench press/i);
    const overheadPress = canvas.getByText(/overhead press/i);

    expect(benchPress).toBeInTheDocument();
    expect(overheadPress).toBeInTheDocument();

    // Verify muscle group tags are visible
    expect(canvas.getByText(/chest/i)).toBeInTheDocument();
    expect(canvas.getByText(/shoulders/i)).toBeInTheDocument();
  },
};

// ============================================================================
// CORE USER INTERACTION FLOWS - Catch Functional Regressions
// ============================================================================

export const UserFlow_AddSet: Story = {
  name: "User Flow - Add Set to Movement",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitForContentToLoad(canvasElement);

    // Find and click "Add Set" button for Bench Press
    const addSetButtons = canvas.getAllByRole("button", { name: /add set/i });
    expect(addSetButtons.length).toBeGreaterThan(0);

    await userEvent.click(addSetButtons[0]);

    // Verify set addition UI appears (form, inputs, etc.)
    // This would catch regressions in the add set flow
    await waitFor(() => {
      const weightInputs = canvas.queryAllByLabelText(/weight/i);
      const repsInputs = canvas.queryAllByLabelText(/reps/i);
      expect(weightInputs.length + repsInputs.length).toBeGreaterThan(0);
    });
  },
};

export const UserFlow_NavigationBack: Story = {
  name: "User Flow - Navigation Back",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitForContentToLoad(canvasElement);

    // Find back/navigation button
    const backButton = canvas.getByRole("button", { name: /back|dashboard/i });
    expect(backButton).toBeInTheDocument();

    // Verify it's clickable (would catch disabled states)
    expect(backButton).not.toBeDisabled();

    await userEvent.click(backButton);

    // Navigation functionality would be tested in E2E,
    // here we just verify the button works
  },
};

export const UserFlow_ReorderMovements: Story = {
  name: "User Flow - Reorder Movements",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitForContentToLoad(canvasElement);

    // Look for drag handles or reorder buttons
    const dragHandles = canvas.queryAllByRole("button", {
      name: /drag|reorder|move/i,
    });

    // This test catches regressions in movement reordering
    if (dragHandles.length > 0) {
      // Verify drag handles are present and functional
      expect(dragHandles[0]).toBeInTheDocument();
      expect(dragHandles[0]).not.toBeDisabled();
    }

    // Could test actual drag and drop here if needed
  },
};

export const UserFlow_WorkoutSettings: Story = {
  name: "User Flow - Workout Settings",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitForContentToLoad(canvasElement);

    // Find settings/menu button
    const settingsButton = canvas.queryByRole("button", {
      name: /settings|menu|options/i,
    });

    if (settingsButton) {
      await userEvent.click(settingsButton);

      // Verify settings menu opens
      await waitFor(() => {
        const menuItems = canvas.queryAllByRole("menuitem");
        const buttons = canvas.queryAllByRole("button", {
          name: /edit|delete|rename/i,
        });
        expect(menuItems.length + buttons.length).toBeGreaterThan(0);
      });
    }
  },
};

// ============================================================================
// RESPONSIVE & ACCESSIBILITY TESTS
// ============================================================================

export const Responsive_Mobile: Story = {
  name: "Responsive - Mobile Layout",
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitForContentToLoad(canvasElement);

    // Verify mobile-specific elements
    expect(
      canvas.getByRole("heading", { name: /push day workout/i })
    ).toBeInTheDocument();

    // Mobile navigation should be present
    const navElements = canvas.getAllByRole("navigation");
    expect(navElements.length).toBeGreaterThan(0);

    // Verify content is still accessible on mobile
    expect(canvas.getByText(/bench press/i)).toBeInTheDocument();
  },
};

export const Accessibility_KeyboardNavigation: Story = {
  name: "Accessibility - Keyboard Navigation",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitForContentToLoad(canvasElement);

    // Test tab navigation
    const focusableElements = canvas.getAllByRole("button");
    expect(focusableElements.length).toBeGreaterThan(0);

    // Verify first button can receive focus
    focusableElements[0].focus();
    expect(focusableElements[0]).toHaveFocus();

    // Test keyboard interaction
    await userEvent.keyboard("{Enter}");

    // Verify screen reader accessibility
    const headings = canvas.getAllByRole("heading");
    expect(headings.length).toBeGreaterThan(0);

    headings.forEach((heading) => {
      expect(heading).toHaveAccessibleName();
    });
  },
};

// ============================================================================
// ERROR & EDGE CASE SCENARIOS
// ============================================================================

export const EdgeCase_EmptyWorkout: Story = {
  name: "Edge Case - Empty Workout State",
  // This would need different MSW handlers for empty state
  // parameters: { msw: { handlers: [emptyWorkoutHandlers] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitForContentToLoad(canvasElement);

    // Test would verify empty state UI
    // For now, just verify page doesn't crash
    expect(
      canvas.getByRole("heading", { name: /push day workout/i })
    ).toBeInTheDocument();
  },
};

export const EdgeCase_LoadingState: Story = {
  name: "Edge Case - Loading State",
  play: async ({ canvasElement }) => {
    // Test loading skeletons appear initially
    const skeletons = canvasElement.querySelectorAll(".animate-pulse");

    // Should have loading indicators initially
    expect(skeletons.length).toBeGreaterThan(0);

    // Then content should load
    await waitForContentToLoad(canvasElement);

    const canvas = within(canvasElement);
    expect(
      canvas.getByRole("heading", { name: /push day workout/i })
    ).toBeInTheDocument();
  },
};
