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
    default: "Grey Collective — Realtor Media",
    template: "%s · Grey Collective Media",
  },
  description:
    "Phase 1 mock workflow: submit media, admin checklist review, publish to public gallery.",
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
      <body className="flex min-h-full flex-col bg-stone-100 text-stone-950 dark:bg-stone-950 dark:text-stone-50">
        <AppNav />
        {children}
      </body>
    </html>
  );
}
