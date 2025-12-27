"use client";

import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { AlertTriangle, RefreshCw, Settings } from "lucide-react";
import React from "react";

// Use compile-time constant to avoid process polyfill issues with Turbopack
const IS_DEV = process.env.NODE_ENV === "development";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Log to external service in production
    if (!IS_DEV) {
      // TODO: Send to error tracking service (Sentry, etc.)
      console.error("Production error:", {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Check if it's a Supabase configuration error
      if (this.state.error.message.includes("Supabase client not available")) {
        return <SupabaseConfigError onRetry={this.handleRetry} />;
      }

      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            retry={this.handleRetry}
          />
        );
      }

      // Default error UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

// Supabase configuration error component
function SupabaseConfigError({ onRetry }: { onRetry: () => void }) {
  const isDevelopment = IS_DEV;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
            <Settings className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle>Configuration Required</CardTitle>
          <CardDescription>
            The application needs to be configured with Supabase credentials to
            function properly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDevelopment ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Development Setup Required</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>To run this application locally, you need to:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>
                    Create a Supabase project at{" "}
                    <a
                      href="https://supabase.com"
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      supabase.com
                    </a>
                  </li>
                  <li>
                    Copy{" "}
                    <code className="bg-muted px-1 rounded">
                      .env.local.example
                    </code>{" "}
                    to <code className="bg-muted px-1 rounded">.env.local</code>
                  </li>
                  <li>
                    Add your Supabase URL and anon key to{" "}
                    <code className="bg-muted px-1 rounded">.env.local</code>
                  </li>
                  <li>Restart the development server</li>
                </ol>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Service Unavailable</AlertTitle>
              <AlertDescription>
                The application is temporarily unavailable due to a
                configuration issue. Please try again later or contact support
                if the problem persists.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={onRetry} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            {isDevelopment && (
              <Button
                variant="outline"
                onClick={() => window.open("/docs/setup", "_blank")}
                className="flex-1"
              >
                Setup Guide
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Default error fallback component
function DefaultErrorFallback({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  const isDevelopment = IS_DEV;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred. Please try refreshing the page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDevelopment && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Development Error</AlertTitle>
              <AlertDescription>
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">
                    Error Details
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                    {error.message}
                    {error.stack && "\n\n" + error.stack}
                  </pre>
                </details>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={onRetry} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
