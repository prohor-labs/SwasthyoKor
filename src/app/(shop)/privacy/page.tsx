import type { Metadata } from "next";
import Link from "next/link";
import {
  EyeSlash,
  FingerScan,
  Key,
  Lock,
  SecurityUser,
  ShieldCheck,
} from "reicon-react";
import { Card, CardContent } from "@/components/ui/card";
import { baseUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "গোপনীয়তা নীতি (Privacy Policy) | স্বাস্থ্যকর",
  description:
    "স্বাস্থ্যকর কীভাবে আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখে, সংরক্ষণ করে এবং ব্যবহার করে তার বিস্তারিত নীতিমালা।",
  alternates: {
    canonical: `${baseUrl}/privacy`,
  },
  openGraph: {
    title: "গোপনীয়তা নীতি (Privacy Policy) | স্বাস্থ্যকর",
    description:
      "স্বাস্থ্যকর কীভাবে আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখে, সংরক্ষণ করে এবং ব্যবহার করে তার বিস্তারিত নীতিমালা।",
    url: `${baseUrl}/privacy`,
    type: "website",
  },
};

const SECTIONS = [
  {
    icon: SecurityUser,
    title: "১. যেসব তথ্য আমরা সংগ্রহ করি",
    content: [
      "অর্ডার সম্পন্ন ও ডেলিভারির সুবিধার্থে আমরা আপনার নাম, ডেলিভারি ঠিকানা, সক্রিয় মোবাইল নম্বর এবং ঐচ্ছিক ইমেইল অ্যাড্রেস সংগ্রহ করি।",
      "আমাদের ওয়েবসাইট ব্রাউজ করার সময় ব্রাউজার টাইপ, আইপি অ্যাড্রেস এবং ভিজিট করা পেজসমূহের সাধারণ অ্যানালিটিক্স তথ্য সংগৃহীত হতে পারে যা সিস্টেমের কর্মক্ষমতা ও অভিজ্ঞতা উন্নয়নে ব্যবহৃত হয়।",
    ],
  },
  {
    icon: Key,
    title: "২. তথ্যের সুনির্দিষ্ট ব্যবহার",
    content: [
      "সংগৃহীত তথ্য কেবল আপনার অর্ডার প্রসেসিং, কুরিয়ার মারফত পার্সেল ডেলিভারি নিশ্চিতকরণ এবং গ্রাহক সহায়তার প্রয়োজনে ব্যবহৃত হয়।",
      "আপনার অনুমতি ছাড়া আমরা কোনো ধরনের অবাঞ্ছিত স্প্যাম এসএমএস বা প্রমোশনাল কল করি না। কেবলমাত্র অর্ডার সংক্রান্ত জরুরি আপডেট এসএমএস/হোয়াটসঅ্যাপে পাঠানো হয়।",
    ],
  },
  {
    icon: EyeSlash,
    title: "৩. তথ্য সুরক্ষা ও তৃতীয় পক্ষের সাথে ভাগাভাগি",
    content: [
      "আমরা আপনার ব্যক্তিগত তথ্য কোনো অবস্থাতেই বাণিজ্যিক স্বার্থে কোনো তৃতীয় পক্ষের কাছে বিক্রি, ভাড়া বা হস্তান্তর করি না।",
      "পণ্য ডেলিভারির স্বার্থে কেবলমাত্র বিশ্বস্ত লজিস্টিক বা কুরিয়ার পার্টনারের সাথে আপনার নাম, ফোন ও ঠিকানা শেয়ার করা হয়।",
    ],
  },
  {
    icon: Lock,
    title: "৪. পেমেন্ট ও আর্থিক তথ্যের নিরাপত্তা",
    content: [
      "আমরা আপনার কোনো ব্যাংক কার্ড নম্বর, পিন বা ওটিপি সংরক্ষণ করি না।",
      "অনলাইন পেমেন্টের ক্ষেত্রে বাংলাদেশ ব্যাংক অনুমোদিত এনক্রিপ্টেড পেমেন্ট গেটওয়ের মাধ্যমে শতভাগ সুরক্ষিতভাবে লেনদেন সম্পন্ন হয়।",
    ],
  },
  {
    icon: FingerScan,
    title: "৫. আপনার অধিকার ও নিয়ন্ত্রণ",
    content: [
      "আমাদের ডাটাবেজে সংরক্ষিত আপনার ব্যক্তিগত তথ্য সংশোধন বা সম্পূর্ণ মুছে ফেলার অধিকার আপনার রয়েছে।",
      "যেকোনো প্রয়োজনে আমাদের সাপোর্ট টিমে বার্তা পাঠিয়ে আপনার তথ্য সম্পর্কিত অনুসন্ধান করতে পারেন।",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="container-layout py-8 sm:py-14 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto mb-10 sm:mb-14">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          গোপনীয়তা নীতিমালা
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          সর্বশেষ সংস্করণ: অক্টোবর ২০২৬ &bull; আপনার তথ্যের গোপনীয়তা ও সুরক্ষা রক্ষা করা
          আমাদের সর্বোচ্চ দায়িত্ব
        </p>
      </div>

      {/* Structured Sections */}
      <div className="flex flex-col gap-4 sm:gap-5">
        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          return (
            <Card
              key={sec.title}
              className="border-border/80 bg-card/60 shadow-2xs overflow-hidden py-0 [--card-spacing:0px]"
            >
              <CardContent className="p-5 sm:p-7 flex flex-col gap-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
                    <Icon className="size-4.5" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    {sec.title}
                  </h2>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground space-y-2.5 leading-relaxed pl-1 sm:pl-10">
                  {sec.content.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Support Box */}
      <div className="mt-10 p-5 rounded-2xl border border-border bg-muted/20 text-center text-xs text-muted-foreground">
        আপনার তথ্যের নিরাপত্তা সম্পর্কিত যেকোনো প্রশ্নের জন্য সরাসরি যোগাযোগ করুন:{" "}
        <a
          href="mailto:support@swasthyokor.com"
          className="font-semibold text-emerald-600 underline underline-offset-4"
        >
          support@swasthyokor.com
        </a>
      </div>
    </div>
  );
}
