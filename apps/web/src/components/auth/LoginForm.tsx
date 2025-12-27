"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { signInWithEmail } from "@fitness/shared";
import { Dumbbell, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Typography } from "../common/Typography";
interface LoginFormProps {
  redirectTo?: string;
}

// Zod schema for form validation
const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm({ redirectTo = "/" }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Initialize form with React Hook Form and Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: standardSchemaResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values: FormData) => {
    setLoading(true);
    setError("");

    try {
      const { user, error: signInError } = await signInWithEmail(
        values.email,
        values.password
      );

      if (signInError) {
        setError(signInError);
        return;
      }

      if (user) {
        router.push(redirectTo);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  });

  return (
    <Card className="w-full max-w-md mx-auto border-none bg-transparent">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center">
          <Dumbbell className="w-6 h-6 mr-2" aria-hidden="true" />
          <Typography variant="title1">Welcome to Logset</Typography>
        </CardTitle>
        <CardDescription className="text-center">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              disabled={loading}
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-muted-foreground"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
                className="pr-10"
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <div className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-md p-3">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !isValid}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link
            href="/reset-password"
            className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
          >
            Forgot your password?
          </Link>

          <div className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary hover:underline underline-offset-4 font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
