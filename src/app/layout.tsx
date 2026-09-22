import type { ReactNode } from "react";

import { QueryProvider } from "@/components/query-provider";
import { FloatingWhatsApp } from "@/components/shared";
import { Toaster } from "@/components/ui/toast";
import { WelcomeToast } from "@/components/welcome-toast";
import "./globals.css";
import localFont from "next/font/local";
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

const siteName = process.env.SITE_NAME || "স্বাস্থ্যকর";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `SwasthyoKor — The Symbol of Faith and Trust | ${siteName}`,
    template: `%s | SwasthyoKor — The Symbol of Faith and Trust`,
  },
  description:
    "স্বাস্থ্যকর (SwasthyoKor) — The Symbol of Faith and Trust. ১০০% খাঁটি সুন্দরবন মধু, ঘানি ভাঙা সরিষার তেল, গাওয়া ঘি ও প্রিমিয়াম অর্গানিক পণ্যের বিশ্বস্ত প্রতিষ্ঠান।",
  keywords: [
    "SwasthyoKor",
    "স্বাস্থ্যকর",
    "অর্গানিক খাবার বাংলাদেশ",
    "সুন্দরবন মধু",
    "খাঁটি সরিষার তেল",
    "গাওয়া ঘি",
    "Organic food Bangladesh",
    "Pure Honey",
    "Cold Pressed Mustard Oil",
  ],
  authors: [{ name: "SwasthyoKor" }],
  creator: "SwasthyoKor",
  publisher: "SwasthyoKor",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
  openGraph: {
    title: "SwasthyoKor — The Symbol of Faith and Trust",
    description:
      "স্বাস্থ্যকর (SwasthyoKor) — The Symbol of Faith and Trust. ১০০% খাঁটি, প্রাকৃতিক ও নিরাপদ পণ্যের বিশ্বস্ত গন্তব্য।",
    siteName: "SwasthyoKor",
    url: baseUrl,
    images: [
      {
        url: "/icon.png",
        width: 640,
        height: 640,
        alt: "SwasthyoKor — The Symbol of Faith and Trust",
      },
    ],
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SwasthyoKor — The Symbol of Faith and Trust",
    description:
      "স্বাস্থ্যকর (SwasthyoKor) — The Symbol of Faith and Trust. ১০০% খাঁটি সুন্দরবন মধু, ঘানি ভাঙা সরিষার তেল, গাওয়া ঘি ও প্রিমিয়াম অর্গানিক পণ্য।",
    images: ["/icon.png"],
  },
  robots: {
    follow: true,
    index: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "SwasthyoKor (স্বাস্থ্যকর)",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icon.png`,
      },
      sameAs: [
        "https://www.facebook.com/swasthyokor",
        "https://www.instagram.com/swasthyokor",
        "https://www.youtube.com/@swasthyokor",
      ],
      description:
        "SwasthyoKor is a leading provider of 100% natural, lab-tested organic honey, cold-pressed mustard oil, and premium organic superfoods in Bangladesh.",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+8801700000000",
        contactType: "Customer Support",
        areaServed: "BD",
        availableLanguage: ["Bengali", "English"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: "SwasthyoKor",
      publisher: {
        "@id": `${baseUrl}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${baseUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="bn"
      suppressHydrationWarning
      className={cn("font-sans", hindSiliguri.variable)}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgJsonLd),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
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
