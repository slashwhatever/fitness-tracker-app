"use client";

import { useEffect } from "react";

/**
 * Component to optimize mobile viewport behavior and encourage address bar hiding
 */
export default function MobileViewportOptimizer() {
  useEffect(() => {
    // Force a small scroll on mobile to hide address bar
    const handleLoad = () => {
      // Only on mobile devices
      if (typeof window !== "undefined" && window.innerWidth <= 768) {
        // Small delay to ensure page is fully loaded
        setTimeout(() => {
          // Scroll down 1px then back up to trigger address bar hiding
          window.scrollTo(0, 1);
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 10);
        }, 100);
      }
    };

    // Run on initial load
    handleLoad();

    // Also run when window is resized (orientation change)
    window.addEventListener("resize", handleLoad);

    // Add meta viewport for better mobile handling
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
      );
    }

    return () => {
      window.removeEventListener("resize", handleLoad);
    };
  }, []);

  return null; // This component doesn't render anything
}
