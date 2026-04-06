import logger from "@/lib/utils/logger";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error("[ErrorBoundary] Caught error:", error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <View className="flex-1 items-center justify-center p-6 bg-background">
          <Text className="text-foreground text-lg font-semibold mb-2">
            Something went wrong
          </Text>
          <Text className="text-muted-foreground text-sm text-center mb-6">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </Text>
          <TouchableOpacity
            onPress={this.reset}
            className="bg-primary px-6 py-3 rounded-xl"
          >
            <Text className="text-primary-foreground font-medium">Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}
