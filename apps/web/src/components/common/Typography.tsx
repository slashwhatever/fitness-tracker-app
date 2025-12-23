import { cn } from "@/lib/utils";

type TypographyVariants =
  | "title1"
  | "title2"
  | "title3"
  | "body"
  | "caption"
  | "footnote";

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  variant?: TypographyVariants;
  as?: React.ElementType;
}

export const Typography = ({
  children,
  className,
  variant = "body",
  as,
}: TypographyProps) => {
  const variantClasses = {
    title1: "text-xl sm:text-2xl lg:text-3xl font-bold",
    title2: "text-lg sm:text-lg font-semibold",
    title3: "text-base font-bold",
    body: "text-base",
    caption: "font-medium text-sm sm:text-base text-muted-foreground",
    footnote: "text-xs sm:text-sm text-muted-foreground",
  };

  const variantClass = variantClasses[variant];

  // allow override of the tag with the "as" prop
  const Tag =
    as ||
    (variant === "title1"
      ? "h1"
      : variant === "title2"
      ? "h2"
      : variant === "title3"
      ? "h3"
      : variant === "body"
      ? "p"
      : variant === "caption"
      ? "p"
      : variant === "footnote"
      ? "p"
      : "p");

  return <Tag className={cn(variantClass, className)}>{children}</Tag>;
};
