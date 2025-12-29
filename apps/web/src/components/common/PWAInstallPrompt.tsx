"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Monitor, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed (running in standalone mode)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as typeof window.navigator & { standalone?: boolean })
          .standalone ||
        document.referrer.includes("android-app://");
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after user has used the app for a bit
      // Check if they've dismissed it before
      const hasSeenPrompt = localStorage.getItem("pwa-prompt-dismissed");
      const installCount = localStorage.getItem("pwa-prompt-shown") || "0";

      if (!hasSeenPrompt && parseInt(installCount) < 3) {
        // Show after 30 seconds of usage
        setTimeout(() => {
          if (!isStandalone) {
            setShowPrompt(true);
            localStorage.setItem(
              "pwa-prompt-shown",
              String(parseInt(installCount) + 1)
            );
          }
        }, 30000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        localStorage.setItem("pwa-installed", "true");
      } else {
        localStorage.setItem("pwa-prompt-dismissed", "true");
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error during PWA installation:", error);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  // Don't show if already installed or no install prompt available
  if (isStandalone || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="shadow-lg border-primary/20 bg-card/95 backdrop-blur">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Install App</CardTitle>
                <CardDescription className="text-sm">
                  Get the full-screen experience
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0 hover:bg-muted"
              aria-label="Dismiss PWA installation prompt"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-4 h-4" />
                <span>No browser address bar</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-4 h-4" />
                <span>Native app-like experience</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 text-center">🚀</span>
                <span>Faster loading & offline support</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleInstallClick} className="flex-1">
                Install App
              </Button>
              <Button variant="outline" onClick={handleDismiss}>
                Not Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
