import type { ReactNode } from "react";
import localFont from "next/font/local";
import { QueryProvider } from "@/components/query-provider";
import { FloatingWhatsApp } from "@/components/shared";
import { Toaster } from "@/components/ui/toast";
import { WelcomeToast } from "@/components/welcome-toast";
import "./globals.css";
import { baseUrl, cn } from "@/lib/utils";

const hindSiliguri = localFont({
  src: [
    {
      path: "../fonts/HindSiliguri-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/HindSiliguri-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/HindSiliguri-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: "SwasthyoKor — The Symbol of Faith and Trust | স্বাস্থ্যকর",
  description:
    "স্বাস্থ্যকর (SwasthyoKor) — The Symbol of Faith and Trust. খাঁটি সুন্দরবন মধু, ঘানি ভাঙা সরিষার তেল, গাওয়া ঘি ও প্রিমিয়াম অর্গানিক পণ্যের বিশ্বস্ত প্রতিষ্ঠান।",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="bn"
      suppressHydrationWarning
      className={cn("font-sans", hindSiliguri.variable)}
    >
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-emerald-300 dark:selection:bg-emerald-800">
        <QueryProvider>
          {children}
          <Toaster />
          <WelcomeToast />
          <FloatingWhatsApp />
        </QueryProvider>
      </body>
    </html>
  );
}
