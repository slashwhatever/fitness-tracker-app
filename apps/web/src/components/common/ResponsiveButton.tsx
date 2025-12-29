"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import { useRouter } from "next/navigation";
import React from "react";

// Type for React elements with className and children props
interface ReactElementWithProps extends React.ReactElement {
  props: {
    children?: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  };
}

type ResponsiveButtonSizes = "sm" | "lg" | "icon" | "default";

type ResponsiveButtonColors =
  | "primary"
  | "secondary"
  | "destructive"
  | "gray"
  | "green"
  | "blue"
  | "purple";

// Color mappings for essential colors only - reduces bundle size significantly
const colorMap: Record<
  ResponsiveButtonColors,
  {
    text: string;
    bg: string;
    hover: string;
    hoverText: string;
    smText: string;
    smBorder: string;
    smHoverBg: string;
  }
> = {
  primary: {
    text: "text-primary",
    bg: "bg-primary",
    hover: "hover:bg-primary/90",
    hoverText: "hover:text-primary",
    smText: "sm:text-primary",
    smBorder: "sm:border-primary",
    smHoverBg: "sm:hover:!bg-primary",
  },
  secondary: {
    text: "text-secondary-foreground",
    bg: "bg-secondary",
    hover: "hover:bg-secondary/80",
    hoverText: "hover:text-secondary-foreground",
    smText: "sm:text-secondary-foreground",
    smBorder: "sm:border-secondary",
    smHoverBg: "sm:hover:!bg-secondary",
  },
  destructive: {
    text: "text-destructive",
    bg: "bg-destructive",
    hover: "hover:bg-destructive/90",
    hoverText: "hover:text-destructive",
    smText: "sm:text-destructive",
    smBorder: "sm:border-destructive",
    smHoverBg: "sm:hover:!bg-destructive",
  },
  gray: {
    text: "text-muted-foreground",
    bg: "bg-muted",
    hover: "hover:bg-muted/80",
    hoverText: "hover:text-muted-foreground",
    smText: "sm:text-muted-foreground",
    smBorder: "sm:border-muted",
    smHoverBg: "sm:hover:!bg-muted",
  },
  green: {
    text: "text-green-600",
    bg: "bg-green-600",
    hover: "hover:bg-green-700",
    hoverText: "hover:text-green-600",
    smText: "sm:text-green-600",
    smBorder: "sm:border-green-600",
    smHoverBg: "sm:hover:!bg-green-600",
  },
  blue: {
    text: "text-blue-600",
    bg: "bg-blue-600",
    hover: "hover:bg-blue-700",
    hoverText: "hover:text-blue-600",
    smText: "sm:text-blue-600",
    smBorder: "sm:border-blue-600",
    smHoverBg: "sm:hover:!bg-blue-600",
  },
  purple: {
    text: "text-purple-600",
    bg: "bg-purple-600",
    hover: "hover:bg-purple-700",
    hoverText: "hover:text-purple-600",
    smText: "sm:text-purple-600",
    smBorder: "sm:border-purple-600",
    smHoverBg: "sm:hover:!bg-purple-600",
  },
};

type ResponsiveButtonProps = {
  children: React.ReactNode;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  size?: ResponsiveButtonSizes;
  color: ResponsiveButtonColors;
  className?: string;
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "link"
    | "secondary"
    | "destructive";
  url?: string; // Optional URL for navigation
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  asChild?: boolean;
} & React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

const ResponsiveButton = ({
  children,
  icon: Icon,
  size = "icon",
  color,
  className,
  variant = "ghost",
  url,
  onClick,
  asChild,
  ...props
}: ResponsiveButtonProps) => {
  const router = useRouter();
  const colors = colorMap[color];
  const hoverTextColor =
    color === "primary"
      ? "sm:hover:!text-primary-foreground"
      : "sm:hover:!text-white";

  // Handle click - navigate if url provided, otherwise call onClick
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (url) {
      router.push(url);
    } else if (onClick) {
      onClick(e);
    }
  };

  // When using asChild, inject icon and responsive structure into the child element
  if (asChild && React.isValidElement(children)) {
    const typedChildren = children as ReactElementWithProps;
    const originalChildren = typedChildren.props.children;
    const enhancedChild = React.cloneElement(typedChildren, {
      ...typedChildren.props,
      className: cn("flex items-center gap-1", typedChildren.props.className),
      children: (
        <>
          <Icon className="flex-shrink-0" />
          <span className="hidden sm:inline">{originalChildren}</span>
        </>
      ),
    });

    return (
      <Button
        variant={variant}
        size={size}
        asChild={asChild}
        className={cn(
          // Base mobile styles: square button with colored icon
          colors.text,
          colors.hoverText,
          "hover:bg-accent/50",
          // Desktop styles: outline default, colored background on hover
          "sm:size-auto sm:px-4 sm:py-2 sm:has-[>svg]:px-3",
          "sm:border",
          colors.smText,
          colors.smBorder,
          colors.smHoverBg,
          hoverTextColor,
          "sm:hover:!border-transparent",
          className
        )}
        {...props}
      >
        {enhancedChild}
      </Button>
    );
  }

  // Default case: not using asChild
  const content = (
    <span className="flex items-center gap-1">
      <Icon className="flex-shrink-0" />
      <span className="hidden sm:inline">{children}</span>
    </span>
  );

  return (
    <Button
      variant={variant}
      size={size}
      asChild={asChild}
      className={cn(
        // Base mobile styles: square button with colored icon
        colors.text,
        colors.hoverText,
        "hover:bg-accent/50",
        // Desktop styles: outline default, colored background on hover
        "sm:size-auto sm:px-4 sm:py-2 sm:has-[>svg]:px-3",
        "sm:border",
        colors.smText,
        colors.smBorder,
        colors.smHoverBg,
        hoverTextColor,
        "sm:hover:!border-transparent",
        className
      )}
      onClick={asChild ? undefined : handleClick}
      {...props}
    >
      {content}
    </Button>
  );
};

export default ResponsiveButton;
