import { SyncStatusProvider } from "@/components/data/SyncStatusProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { SupabaseProvider } from "@/lib/providers/SupabaseProvider";
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
          <SupabaseProvider>
            <AuthProvider>
              <SyncStatusProvider>
                {children}
              </SyncStatusProvider>
            </AuthProvider>
          </SupabaseProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
