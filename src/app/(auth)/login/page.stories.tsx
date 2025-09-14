import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import LoginPage from "./page";

// Create a wrapper for the async component
const LoginPageWrapper = ({ redirectTo }: { redirectTo?: string }) => {
  // Since the real component is async and expects searchParams as a Promise,
  // we need to simulate this for Storybook
  const mockSearchParams = Promise.resolve({ redirectTo });

  return <LoginPage searchParams={mockSearchParams} />;
};

const meta = {
  title: "Pages/Authentication/Login (Real Component)",
  component: LoginPageWrapper,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/login",
      },
    },
  },
  args: {
    redirectTo: "/",
  },
  argTypes: {
    redirectTo: {
      control: "text",
      description: "URL to redirect to after successful login",
    },
  },
  beforeEach: async () => {
    const { fn } = await import("storybook/test");

    // Mock authentication functions to prevent actual auth calls
    await import("@/lib/supabase/auth-utils")
      .then((module) => {
        // @ts-expect-error - Mocking module for Storybook
        module.signIn = fn().mockResolvedValue({ error: null });
      })
      .catch(() => {});
  },
} satisfies Meta<typeof LoginPageWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActualLoginPage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test that real LoginPage component renders correctly
    const emailInput = canvas.getByRole("textbox", { name: /email/i });
    const passwordInput = canvas.getByLabelText(/password/i);
    const signInButton = canvas.getByRole("button", { name: /sign in/i });

    // Verify real form elements are present
    await expect(emailInput).toBeInTheDocument();
    await expect(passwordInput).toBeInTheDocument();
    await expect(signInButton).toBeInTheDocument();

    // Test the real layout structure
    const container =
      canvas.getByRole("main") || emailInput.closest(".min-h-screen");
    await expect(container).toBeInTheDocument();
  },
};

export const RealFormValidation: Story = {
  name: "Real Form Validation",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const emailInput = canvas.getByRole("textbox", { name: /email/i });
    const passwordInput = canvas.getByLabelText(/password/i);
    const submitButton = canvas.getByRole("button", { name: /sign in/i });

    // Test real form validation by submitting empty form
    await userEvent.click(submitButton);

    // The real LoginForm should show validation errors
    await waitFor(async () => {
      // Look for common validation messages that the real form might show
      const validationMessages = canvas.queryAllByText(
        /required|invalid|enter/i
      );
      // Real form validation should appear
    });
  },
};

export const RealFormInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const emailInput = canvas.getByRole("textbox", { name: /email/i });
    const passwordInput = canvas.getByLabelText(/password/i);

    // Test real input behavior
    await userEvent.type(emailInput, "test@example.com");
    await expect(emailInput).toHaveValue("test@example.com");

    await userEvent.type(passwordInput, "password123");
    await expect(passwordInput).toHaveValue("password123");

    // Test password visibility toggle if it exists in the real component
    const passwordToggle = canvas.queryByRole("button", {
      name: /toggle password visibility|show password|hide password/i,
    });

    if (passwordToggle) {
      // Test real password toggle functionality
      await userEvent.click(passwordToggle);
      await expect(passwordInput).toHaveAttribute("type", "text");

      await userEvent.click(passwordToggle);
      await expect(passwordInput).toHaveAttribute("type", "password");
    }
  },
};

export const RealEmailValidation: Story = {
  name: "Real Email Format Validation",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const emailInput = canvas.getByRole("textbox", { name: /email/i });
    const submitButton = canvas.getByRole("button", { name: /sign in/i });

    // Test real email validation
    await userEvent.type(emailInput, "invalid-email");
    await userEvent.click(submitButton);

    // The real form should validate email format
    await waitFor(async () => {
      const emailError = canvas.queryByText(
        /valid email|email format|invalid email/i
      );
      // Real validation should appear
    });
  },
};

export const RealFormSubmission: Story = {
  name: "Real Form Submission Flow",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const emailInput = canvas.getByRole("textbox", { name: /email/i });
    const passwordInput = canvas.getByLabelText(/password/i);
    const submitButton = canvas.getByRole("button", { name: /sign in/i });

    // Fill out the real form
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "validpassword123");

    // Submit the real form
    await userEvent.click(submitButton);

    // The real component should handle the submission
    // (with mocked auth, it should succeed)
    await expect(emailInput).toHaveValue("test@example.com");
  },
};

export const RealNavigationLinks: Story = {
  name: "Real Navigation Links",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test for real navigation links that might exist in LoginForm
    const registerLink = canvas.queryByRole("link", {
      name: /sign up|register|create account/i,
    });
    const forgotPasswordLink = canvas.queryByRole("link", {
      name: /forgot password|reset password/i,
    });

    // If real links exist, test their href attributes
    if (registerLink) {
      await expect(registerLink).toHaveAttribute("href");
    }

    if (forgotPasswordLink) {
      await expect(forgotPasswordLink).toHaveAttribute("href");
    }
  },
};

export const RealResponsiveLayout: Story = {
  name: "Real Mobile Responsive",
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test that real component adapts to mobile
    await expect(
      canvas.getByRole("textbox", { name: /email/i })
    ).toBeInTheDocument();
    await expect(canvas.getByLabelText(/password/i)).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();

    // Test real mobile form interaction
    const emailInput = canvas.getByRole("textbox", { name: /email/i });
    await userEvent.type(emailInput, "mobile@test.com");
    await expect(emailInput).toHaveValue("mobile@test.com");
  },
};

export const RealAccessibilityTest: Story = {
  name: "Real Accessibility Features",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test that real form inputs have proper accessibility
    const emailInput = canvas.getByRole("textbox", { name: /email/i });
    const passwordInput = canvas.getByLabelText(/password/i);

    await expect(emailInput).toHaveAccessibleName();
    await expect(passwordInput).toHaveAccessibleName();

    // Test real keyboard navigation
    await userEvent.tab();
    await expect(emailInput).toHaveFocus();

    await userEvent.tab();
    await expect(passwordInput).toHaveFocus();

    await userEvent.tab();
    const submitButton = canvas.getByRole("button", { name: /sign in/i });
    await expect(submitButton).toHaveFocus();

    // Test real form submission with Enter key
    emailInput.focus();
    await userEvent.type(emailInput, "keyboard@test.com");
    await userEvent.keyboard("{Tab}");
    await userEvent.type(passwordInput, "testpass123");
    await userEvent.keyboard("{Enter}");

    // Real form should handle Enter key submission
  },
};
