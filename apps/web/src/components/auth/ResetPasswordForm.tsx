"use client";

import { Typography } from "@components/common/Typography";
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
import { resetPassword } from "@fitness/shared";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Dumbbell, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

type FormData = z.infer<typeof formSchema>;

const ResetPasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: standardSchemaResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await resetPassword(values.email);

      if (resetError) {
        setError(resetError);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Reset password error:", err);
    } finally {
      setLoading(false);
    }
  });

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto border-none bg-transparent">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-green-600">
            Check Your Email
          </CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent a password reset link to your email address. Click
            the link in the email to reset your password.
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <div className="text-sm text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or try again.
          </div>

          <div className="flex flex-col space-y-2">
            <Button
              variant="outline"
              onClick={() => setSuccess(false)}
              className="w-full"
            >
              Try Again
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto border-none bg-transparent">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center">
          <Dumbbell className="w-6 h-6 mr-2" aria-hidden="true" />
          <Typography variant="title1">Reset Your Password</Typography>
        </CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-muted-foreground"
            >
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              {...register("email")}
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
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
              disabled={!isValid || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <div className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline underline-offset-4 font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResetPasswordForm;
