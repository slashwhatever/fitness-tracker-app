import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";
import BackgroundSyncProvider from "@/components/common/BackgroundSyncProvider";
import MobileViewportOptimizer from "@/components/common/MobileViewportOptimizer";
import PWAInstallPrompt from "@/components/common/PWAInstallPrompt";
import TimerBanner from "@/components/common/TimerBanner";
import { TimerProvider } from "@/contexts/TimerContext";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fitness Tracking App",
  description: "Track your workouts and fitness progress with no distractions",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FitnessTracker",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/favicon-32x32.png",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <ReactQueryClientProvider>
            <AuthProvider>
              <BackgroundSyncProvider>
                <TimerProvider>
                  <MobileViewportOptimizer />
                  <TimerBanner />
                  {children}
                  <PWAInstallPrompt />
                </TimerProvider>
              </BackgroundSyncProvider>
            </AuthProvider>
          </ReactQueryClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
