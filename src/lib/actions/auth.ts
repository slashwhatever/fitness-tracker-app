"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// Validation schemas
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type AuthActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function loginAction(
  formData: FormData
): Promise<AuthActionResult> {
  try {
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // Validate input
    const result = loginSchema.safeParse(rawData);
    if (!result.success) {
      return {
        success: false,
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const { email, password } = result.data;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/");
    redirect("/");
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function registerAction(
  formData: FormData
): Promise<AuthActionResult> {
  try {
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    // Validate input
    const result = registerSchema.safeParse(rawData);
    if (!result.success) {
      return {
        success: false,
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const { email, password } = result.data;
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/");
    redirect("/login?message=Check your email to confirm your account");
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function signOutAction(): Promise<AuthActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/");
    redirect("/login");
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
