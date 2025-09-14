"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type NavigationContext =
  | { type: "dashboard" }
  | { type: "workout-detail"; workoutName?: string }
  | {
      type: "movement-detail";
      workoutId: string;
      workoutName?: string;
      movementName?: string;
    }
  | { type: "settings" }
  | { type: "library" };

interface ContextualNavigationProps {
  context: NavigationContext;
}

export default function ContextualNavigation({
  context,
}: ContextualNavigationProps) {
  const router = useRouter();

  // Determine back navigation based on context
  const getBackNavigation = () => {
    switch (context.type) {
      case "dashboard":
        return null; // No back button on dashboard (root)

      case "workout-detail":
        return {
          href: "/",
          label: "Dashboard",
        };

      case "movement-detail":
        return {
          href: `/workout/${context.workoutId}`,
          label: context.workoutName || "Workout",
        };

      case "settings":
      case "library":
        return {
          href: "/",
          label: "Dashboard",
        };

      default:
        return {
          href: "/",
          label: "Dashboard",
        };
    }
  };

  // Generate breadcrumbs for desktop
  const getBreadcrumbs = () => {
    switch (context.type) {
      case "dashboard":
        return null;

      case "workout-detail":
        return (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {context.workoutName || "Workout"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        );

      case "movement-detail":
        return (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/workout/${context.workoutId}`}>
                  <span className="max-w-[150px] truncate block">
                    {context.workoutName || "Workout"}
                  </span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  <span className="max-w-[150px] truncate block">
                    {context.movementName || "Movement"}
                  </span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        );

      case "settings":
        return (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        );

      case "library":
        return (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Movement library</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        );

      default:
        return null;
    }
  };

  const backNavigation = getBackNavigation();
  const breadcrumbs = getBreadcrumbs();

  // Don't render anything if no navigation is needed
  if (!backNavigation && !breadcrumbs) {
    return null;
  }

  return (
    <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 border-b border-border/40">
      <div className="max-w-4xl mx-auto">
        {/* Mobile Navigation */}
        {backNavigation && (
          <div className="md:hidden py-3">
            <Link href={backNavigation.href}>
              <Button variant="ghost" size="sm" className="h-9 px-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="font-medium">{backNavigation.label}</span>
              </Button>
            </Link>
          </div>
        )}

        {/* Desktop Breadcrumbs */}
        {breadcrumbs && (
          <div className="hidden md:block py-3">{breadcrumbs}</div>
        )}
      </div>
    </div>
  );
}
