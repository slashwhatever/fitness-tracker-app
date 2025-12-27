"use client";

import { useTimer } from "@/contexts/TimerContext";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@components/ui/breadcrumb";
import { Button } from "@components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type NavigationContext =
  | { type: "dashboard" }
  | { type: "create-workout" }
  | { type: "workout-detail"; workoutName?: string }
  | {
      type: "workout-settings";
      workoutId: string;
      workoutName?: string;
    }
  | {
      type: "movement-detail";
      workoutId: string;
      workoutName?: string;
      movementName?: string;
    }
  | {
      type: "library-movement-detail";
      movementName?: string;
    }
  | {
      type: "quick-log-movement-detail";
      movementName?: string;
    }
  | { type: "create-movement" }
  | { type: "settings" }
  | { type: "library" }
  | { type: "analytics" };

interface ContextualNavigationProps {
  context: NavigationContext;
}

export default function ContextualNavigation({
  context,
}: ContextualNavigationProps) {
  const { isActive: timerActive, isPinned: timerPinned } = useTimer();

  // Check if timer is pinned and active - if so, we need to position below it
  const timerIsVisible = timerActive && timerPinned;

  // Determine back navigation based on context
  const getBackNavigation = () => {
    switch (context.type) {
      case "dashboard":
        return null; // No back button on dashboard (root)

      case "create-workout":
        return {
          href: "/",
          label: "Dashboard",
        };

      case "workout-detail":
        return {
          href: "/",
          label: "Dashboard",
        };

      case "workout-settings":
        return {
          href: `/workout/${context.workoutId}`,
          label: context.workoutName || "Workout",
        };

      case "movement-detail":
        return {
          href: `/workout/${context.workoutId}`,
          label: context.workoutName || "Workout",
        };

      case "library-movement-detail":
        return {
          href: "/library",
          label: "Movement Library",
        };

      case "quick-log-movement-detail":
        return {
          href: "/",
          label: "Dashboard",
        };

      case "create-movement":
        return {
          href: "/library",
          label: "Movement Library",
        };

      case "settings":
      case "library":
      case "analytics":
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

      case "create-workout":
        return (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>New workout</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        );

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

      case "workout-settings":
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
                <BreadcrumbPage>Settings</BreadcrumbPage>
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

      case "library-movement-detail":
        return (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/library">
                  Movement Library
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  <span className="max-w-[200px] truncate block">
                    {context.movementName || "Movement"}
                  </span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        );

      case "quick-log-movement-detail":
        return (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  <span className="max-w-[200px] truncate block">
                    {context.movementName || "Movement"}
                  </span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        );

      case "create-movement":
        return (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/library">
                  Movement Library
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>New movement</BreadcrumbPage>
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

      case "analytics":
        return (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Analytics</BreadcrumbPage>
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
    <div
      className={`sticky bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-b border-border/40 ${
        timerIsVisible ? "top-[3rem]" : "top-0"
      }`}
    >
      <div className="max-w-4xl mx-auto px-2 sm:px-0">
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
