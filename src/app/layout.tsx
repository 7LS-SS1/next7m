// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Prompt } from "next/font/google";
import AppShell from "@/components/AppShell";
import ThemeHydrator from "@/components/ThemeHydrator";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME ?? "Next7M",
  description: "Next.js 14 + Prisma + Vercel boilerplate",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      data-gramm="false"
      className={prompt.className}
    >
      <body
        suppressHydrationWarning
        data-gramm="false"
        className="min-h-screen bg-[rgb(var(--bg))] text-white"
      >
        <ThemeHydrator />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}