import TimerBanner from "@/components/common/TimerBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";
import { TimerProvider } from "@/contexts/TimerContext";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import type { Metadata } from "next";
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
  title: "Logset: Fitness Tracking App",
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
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
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
