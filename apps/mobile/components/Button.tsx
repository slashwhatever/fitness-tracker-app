import { useThemeColors } from "@hooks/useThemeColors";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
  className?: string; // For nativewind
}

export function Button({
  variant = "default",
  size = "default",
  loading = false,
  icon,
  iconRight,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const colors = useThemeColors();
  // Base styles
  let containerStyles = "flex-row items-center justify-center rounded-xl";
  let textStyles = "font-semibold";

  // Variant styles
  switch (variant) {
    case "default":
      containerStyles += " bg-primary active:opacity-90";
      textStyles += " text-white";
      break;
    case "destructive":
      containerStyles +=
        " bg-red-500/10 border border-red-500/20 active:bg-red-500/20";
      textStyles += " text-red-500";
      break;
    case "outline":
      containerStyles +=
        " bg-transparent border border-border active:bg-slate-50 dark:active:bg-dark-bg/50";
      textStyles += " text-foreground";
      break;
    case "ghost":
      containerStyles +=
        " bg-transparent active:bg-slate-100 dark:active:bg-dark-bg/50";
      textStyles += " text-foreground";
      break;
    case "secondary":
      containerStyles += " bg-slate-100 dark:bg-card active:opacity-80";
      textStyles += " text-foreground";
      break;
  }

  // Size styles
  switch (size) {
    case "default":
      containerStyles += " px-4 py-3.5";
      textStyles += " text-base";
      break;
    case "sm":
      containerStyles += " px-3 py-2";
      textStyles += " text-sm";
      break;
    case "lg":
      containerStyles += " px-6 py-4";
      textStyles += " text-lg";
      break;
    case "icon":
      containerStyles += " w-10 h-10 p-0";
      break;
  }

  // Disabled/Loading styles
  if (disabled || loading) {
    containerStyles += " opacity-50";
  }

  return (
    <TouchableOpacity
      className={`${containerStyles} ${className}`}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "default" ? "white" : colors.icon}
          className="mr-2"
        />
      ) : icon ? (
        <View className={children ? "mr-2" : ""}>{icon}</View>
      ) : null}

      {children && (
        <Text className={`${textStyles} ${loading ? "ml-1" : ""}`}>
          {children}
        </Text>
      )}

      {iconRight && !loading && (
        <View className={children ? "ml-2" : ""}>{iconRight}</View>
      )}
    </TouchableOpacity>
  );
}
