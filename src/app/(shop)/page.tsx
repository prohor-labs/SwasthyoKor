import { Suspense } from "react";
import { ThreeItemGrid } from "@/components/grid";
import {
  CategoryShowcaseSection,
  CategorySlider,
  CollectionTabsSection,
  FlashDealsSection,
  HeroSection,
  ResellerBanner,
  TrustFeaturesBar,
} from "@/components/landing";

import { Skeleton } from "@/components/ui/skeleton";

import { baseUrl } from "@/lib/utils";

export const metadata = {
  title: "SwasthyoKor — The Symbol of Faith and Trust | স্বাস্থ্যকর",
  description:
    "স্বাস্থ্যকর (SwasthyoKor) — The Symbol of Faith and Trust. খাঁটি সুন্দরবন মধু, ঘানি ভাঙা সরিষার তেল, গাওয়া ঘি ও সেরা অর্গানিক সুপারফুড।",
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: "SwasthyoKor — The Symbol of Faith and Trust",
    description:
      "স্বাস্থ্যকর (SwasthyoKor) — The Symbol of Faith and Trust. খাঁটি সুন্দরবন মধু, ঘানি ভাঙা সরিষার তেল, গাওয়া ঘি ও সেরা অর্গানিক সুপারফুড।",
    type: "website",
    url: baseUrl,
    images: [
      {
        url: "/icon.png",
        width: 640,
        height: 640,
        alt: "SwasthyoKor — The Symbol of Faith and Trust",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SwasthyoKor — The Symbol of Faith and Trust | স্বাস্থ্যকর",
    description:
      "স্বাস্থ্যকর (SwasthyoKor) — The Symbol of Faith and Trust. খাঁটি সুন্দরবন মধু, ঘানি ভাঙা সরিষার তেল, গাওয়া ঘি ও সেরা অর্গানিক সুপারফুড।",
    images: ["/icon.png"],
  },
};

const homeFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "স্বাস্থ্যকর (SwasthyoKor)-এর পণ্যগুলো কেন শতভাগ খাঁটি ও নিরাপদ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "স্বাস্থ্যকর (SwasthyoKor) সরাসরি সুন্দরবনের মৌয়ালদের কাছ থেকে অপরিশোধিত খাঁটি মধু, নিজস্ব ঘানিতে ভাঙা কাঠের ঘানির সরিষার তেল এবং দেশি গাভীর দুধ থেকে প্রস্তুতকৃত প্রিমিয়াম গাওয়া ঘি সংগ্রহ ও প্রক্রিয়াজাত করে। প্রতিটি পণ্য রাসায়নিক ও প্রিজারভেটিভমুক্ত।",
      },
    },
    {
      "@type": "Question",
      name: "সারাদেশে ডেলিভারি ও পেমেন্ট পদ্ধতি কেমন?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "আমরা সম্পূর্ণ বাংলাদেশে হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা প্রদান করি। এছাড়া বিকাশ, নগদ, রকেট এবং অনলাইন ব্যাংকিংয়ের মাধ্যমে সহজে ও নিরাপদে পেমেন্ট করা যায়।",
      },
    },
    {
      "@type": "Question",
      name: "অর্ডার করার পর কত দিনে পণ্য হাতে পাব?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ঢাকা মেট্রোর ভেতরে ২৪-৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে সর্বোচ্চ ২-৩ দিনের মধ্যে গ্রাহকের ঠিকানায় পণ্য পৌঁছে দেওয়া হয়।",
      },
    },
  ],
};

import { getCategorySliderCategories, getHeroBanners } from "@/lib/db/queries";

export default async function HomePage() {
  const [banners, categorySliderItems] = await Promise.all([
    getHeroBanners(),
    getCategorySliderCategories(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeFaqSchema),
        }}
      />
      <div className="flex flex-col gap-2 sm:gap-4">
        {/* 1. Hero 16:9 Banner Slider */}
        <HeroSection slides={banners} />

        {/* 2. Top Circular Category Badges (100% Dynamic from Database) */}
        <CategorySlider categories={categorySliderItems} />

        {/* 3. Flash Deals / আজকের সেরা অফার */}
        <Suspense fallback={null}>
          <FlashDealsSection />
        </Suspense>

        {/* 4. Editorial 3-Item Featured Bento Grid */}
        <div className="mx-auto w-full max-w-7xl px-4 py-2 sm:py-4">
          <Suspense
            fallback={
              <div className="grid gap-3 sm:gap-4 md:grid-cols-6 md:grid-rows-2">
                <Skeleton className="h-[280px] sm:h-[380px] md:h-[480px] rounded-2xl md:col-span-4 md:row-span-2" />
                <Skeleton className="h-[180px] sm:h-[220px] rounded-2xl md:col-span-2 md:row-span-1" />
                <Skeleton className="h-[180px] sm:h-[220px] rounded-2xl md:col-span-2 md:row-span-1" />
              </div>
            }
          >
            <ThreeItemGrid />
          </Suspense>
        </div>

        {/* 5. Category-wise Dedicated Showcase Grids (Honey, Ghee/Oils, Superfoods, Nuts) */}
        <Suspense fallback={null}>
          <CategoryShowcaseSection />
        </Suspense>

        {/* 6. Continuous Auto-scrolling Product Carousel */}
        <CollectionTabsSection />

        {/* 7. Trust & Guarantee Feature Bar */}
        <TrustFeaturesBar />

        {/* 8. Reseller / Wholesale Program Card */}
        <ResellerBanner />
      </div>
    </>
  );
}
