import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppNav } from "@/components/app-nav";

/**
 * Shell only — domain wiring lives in `lib/media/*` and `app/actions/media.ts`.
 * FUTURE: auth provider, analytics, Toaster for notifications, strict CSP for Vercel hardening.
 */
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
  title: {
    default: "Grey Collective — Media Intake",
    template: "%s · Grey Collective Media Intake",
  },
  description:
    "Controlled intake, review, and publishing for broker media, construction progress, milestones, and marketing assets (Phase 2 mock).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <AppNav />
        {children}
      </body>
    </html>
  );
}
