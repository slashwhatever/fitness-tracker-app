"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, AlertTriangle, Home } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface LibraryErrorBoundaryProps {
  children: React.ReactNode;
}

export default function LibraryErrorBoundary({ children }: LibraryErrorBoundaryProps) {
  const queryClient = useQueryClient();

  const handleRetry = () => {
    // Clear library-related queries
    queryClient.invalidateQueries({ queryKey: ["movements", "templates"] });
    queryClient.invalidateQueries({ queryKey: ["movements", "user"] });
    queryClient.invalidateQueries({ queryKey: ["muscle_groups"] });
    queryClient.invalidateQueries({ queryKey: ["tracking_types"] });
    
    // Refresh the page as fallback
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <ErrorBoundary
      fallback={({ error, retry }) => (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Library Error</CardTitle>
              <CardDescription>
                Unable to load the movement library. This might be due to a connectivity issue or temporary service interruption.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button onClick={handleRetry} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload Library
                </Button>
                <Button variant="outline" onClick={handleGoHome} className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>
              {process.env.NODE_ENV === "development" && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                    {error?.message || "Unknown error"}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}