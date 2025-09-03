import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { TimerProvider } from "@/contexts/TimerContext";
import TimerBanner from "@/components/common/TimerBanner";
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
