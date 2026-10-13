import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  CheckCircle,
  Clock,
  Heart,
  HelpCircle,
  ShieldCheck,
  Truck,
  Users,
} from "reicon-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/config";
import { baseUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে | স্বাস্থ্যকর (SwasthyoKor)",
  description:
    "স্বাস্থ্যকর-এর লক্ষ্য, প্রতিশ্রুতি ও খাঁটি খাদ্যের অভিযাত্রা। তৃণমূল পর্যায় থেকে সংগৃহীত নির্ভেজাল ও স্বাস্থ্যসম্মত অর্গানিক খাদ্যপণ্য।",
  alternates: {
    canonical: `${baseUrl}/about`,
  },
  openGraph: {
    title: "আমাদের সম্পর্কে | স্বাস্থ্যকর (SwasthyoKor)",
    description:
      "স্বাস্থ্যকর-এর লক্ষ্য, প্রতিশ্রুতি ও খাঁটি খাদ্যের অভিযাত্রা। তৃণমূল পর্যায় থেকে সংগৃহীত নির্ভেজাল ও স্বাস্থ্যসম্মত অর্গানিক খাদ্যপণ্য।",
    url: `${baseUrl}/about`,
    type: "website",
  },
};

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "সততা ও স্বচ্ছতা",
    desc: "পণ্যের উৎস, প্রক্রিয়াজাতকরণ ও মান নিয়ে কোনো লুকোচুরি নেই। আমরা যা বলি, পণ্যে ঠিক তাই পাবেন।",
    color:
      "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
  },
  {
    icon: Award,
    title: "পরীক্ষিত মান",
    desc: "সুন্দরবনের মৌয়ালদের খাঁটি মধু কিংবা নিজস্ব তত্ত্বাবধানে ভাঙা কাঠের ঘানির সরিষার তেল—প্রতিটি লট যাচাইকৃত।",
    color:
      "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
  },
  {
    icon: Heart,
    title: "স্বাস্থ্য সচেতনতা",
    desc: "প্রিজারভেটিভ, কেমিক্যাল বা কৃত্রিম রঙমুক্ত খাবার আপনার ও পরিবারের সুস্থ জীবনের প্রথম শর্ত।",
    color:
      "text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
  },
  {
    icon: Truck,
    title: "দ্রুত ও নিরাপদ ডেলিভারি",
    desc: "সারা দেশে ক্যাশ অন ডেলিভারি এবং প্যাকেট খুলে পণ্য দেখে মূল্য পরিশোধের নির্ভরযোগ্য ব্যবস্থা।",
    color:
      "text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
  },
];

const STATS = [
  { label: "খাঁটি পণ্য ক্যাটাগরি", value: "১০+" },
  { label: "সন্তুষ্ট নিয়মিত গ্রাহক", value: "৫,০০০+" },
  { label: "গুণগত মান নিশ্চিতকরণ", value: "১০০%" },
  { label: "ডেলিভারি কাভারেজ", value: "৬৪ জেলা" },
];

export default function AboutPage() {
  return (
    <div className="container-layout py-8 sm:py-14 max-w-5xl">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center gap-3 sm:gap-4 max-w-3xl mx-auto mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
          বিশুদ্ধতার প্রতীক, <br className="hidden sm:inline" />
          <span className="text-emerald-600 dark:text-emerald-500">
            সুস্থ জীবনের বিশ্বস্ত সঙ্গী
          </span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          স্বাস্থ্যকর (SwasthyoKor) প্রতিষ্ঠিত হয়েছে একটি সুস্পষ্ট বিশ্বাস নিয়ে—খাবারে কোনো
          ভেজাল বা রাসায়নিক আপস চলবে না। আমরা তৃণমূলের কৃষক, মৌয়াল ও দেশীয় কারিগরদের থেকে
          সরাসরি খাঁটি খাদ্যপণ্য আপনার ঘরে পৌঁছে দিই।
        </p>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-12 sm:mb-16">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border border-border bg-card/60 backdrop-blur-xs text-center shadow-xs"
          >
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-500 tracking-tight">
              {stat.value}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Story Section */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-emerald-50/20 dark:to-emerald-950/20 p-6 sm:p-10 lg:p-12 mb-12 sm:mb-16 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
              <Clock className="size-4" /> আমাদের শুরুর গল্প
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              যেভাবে শুরু স্বাস্থ্যকরের অভিযাত্রা
            </h2>
            <div className="text-sm sm:text-base text-muted-foreground space-y-3 leading-relaxed">
              <p>
                বাজারে ভেজাল খাবারের ভিড়ে পরিবারের জন্য এক ফোঁটা খাঁটি মধু কিংবা ঘানি ভাঙা
                ভেজালমুক্ত সরিষার তেল খুঁজে পাওয়া একসময় ছিল এক কঠিন সংগ্রাম। সেই তীব্র
                প্রয়োজন থেকেই স্বাস্থ্যকরের জন্ম।
              </p>
              <p>
                আমরা কোনো মধ্যস্বত্বভোগী বা রিফাইনারি প্রক্রিয়ার ওপর নির্ভর না করে সরাসরি
                সুন্দরবনের পেশাদার মৌয়ালদের কাছ থেকে মধু সংগ্রহ করি এবং গ্রামের ঐতিহ্যবাহী
                কাঠের ঘানি থেকে প্রথম চাপের সরিষার তেল নিয়ে আসি।
              </p>
              <p>
                প্রতিটি পণ্য স্বাস্থ্যসম্মত কাঁচের জারে বা ফুড-গ্রেড প্যাকেজিংয়ে বোতলজাত করা হয়,
                যাতে পুষ্টি ও সুবাস কোনোভাবেই নষ্ট না হয়।
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-3 sm:gap-4 bg-background/80 dark:bg-card p-5 sm:p-6 rounded-2xl border border-border/60">
            <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2 text-foreground">
              <CheckCircle className="size-4 text-emerald-600" />
              আমাদের প্রধান বৈশিষ্ট্য
            </h3>
            <ul className="text-xs sm:text-sm text-muted-foreground space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>শতভাগ প্রাকৃতিক, কোনো কৃত্রিম প্রিজারভেটিভ বা এসেন্স নেই</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>সরাসরি তৃণমূল কৃষক ও অভিজ্ঞ মৌয়ালদের থেকে সংগৃহীত</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>ফুড-গ্রেড ও হাইজেনিক প্যাকেজিং গ্যারান্টি</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>পণ্য হাতে পেয়ে যাচাই করার পূর্ণ স্বাধীনতা</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars */}
      <div className="mb-12 sm:mb-16">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            আমাদের মূল অঙ্গীকারসমূহ
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            প্রতিটি পণ্য ডেলিভারির পেছনে থাকে আমাদের এই চারটি মূলনীতি
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card
                key={pillar.title}
                className="border-border/80 hover:border-emerald-500/50 transition-colors shadow-2xs py-0 [--card-spacing:0px]"
              >
                <CardContent className="p-5 sm:p-6 flex flex-col gap-3">
                  <div
                    className={`size-10 sm:size-11 rounded-xl flex items-center justify-center border ${pillar.color}`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-foreground">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {pillar.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA Box */}
      <div className="text-center rounded-2xl sm:rounded-3xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 sm:p-10 flex flex-col items-center gap-4">
        <h3 className="text-xl sm:text-2xl font-bold text-foreground">
          আজই শুরু হোক সুস্থ ও নির্ভেজাল খাদ্যাভ্যাস
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg">
          আমাদের খাঁটি মধু, তেল, ঘি ও প্রিমিয়াম ড্রাই ফ্রুটসের কালেকশন দেখুন এবং আপনার
          পরিবারের পুষ্টি নিশ্চিত করুন।
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
          <Button
            render={
              <Link href="/search">
                <span>পণ্যসমূহ দেখুন</span>
                <ArrowRight className="size-4" />
              </Link>
            }
            size="lg"
            className="rounded-full px-6 gap-2"
          />
          <Button
            render={<Link href="/contact">যোগাযোগ করুন</Link>}
            variant="outline"
            size="lg"
            className="rounded-full px-6"
          />
        </div>
      </div>
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}
