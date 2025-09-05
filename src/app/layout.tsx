import TimerBanner from "@/components/common/TimerBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";
import { TimerProvider } from "@/contexts/TimerContext";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fitness Tracking App",
  description: "Professional fitness tracking app with workout logging, movement library, and progress analytics",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <ReactQueryClientProvider>
            <AuthProvider>
              <TimerProvider>
                <TimerBanner />
                {children}
              </TimerProvider>
            </AuthProvider>
          </ReactQueryClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
