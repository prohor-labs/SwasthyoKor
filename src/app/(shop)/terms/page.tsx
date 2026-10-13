import type { Metadata } from "next";
import Link from "next/link";
import {
  CardTick,
  DocumentText,
  Lock,
  Refresh2,
  ShieldSecurity,
  Truck,
} from "reicon-react";
import { Card, CardContent } from "@/components/ui/card";
import { baseUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "শর্তাবলী (Terms & Conditions) | স্বাস্থ্যকর",
  description:
    "স্বাস্থ্যকর-এর সেবাসমূহ ব্যবহারের নিয়মাবলী, অর্ডার প্রক্রিয়া, মূল্য পরিশোধ, শিপিং এবং দায়বদ্ধতা সম্পর্কিত পূর্ণাঙ্গ শর্তাবলী।",
  alternates: {
    canonical: `${baseUrl}/terms`,
  },
  openGraph: {
    title: "শর্তাবলী (Terms & Conditions) | স্বাস্থ্যকর",
    description:
      "স্বাস্থ্যকর-এর সেবাসমূহ ব্যবহারের নিয়মাবলী, অর্ডার প্রক্রিয়া, মূল্য পরিশোধ, শিপিং এবং দায়বদ্ধতা সম্পর্কিত পূর্ণাঙ্গ শর্তাবলী।",
    url: `${baseUrl}/terms`,
    type: "website",
  },
};

const SECTIONS = [
  {
    icon: DocumentText,
    title: "১. সাধারণ নিয়মাবলী ও সম্মতি",
    content: [
      "স্বাস্থ্যকর (SwasthyoKor) ওয়েবসাইট বা অফিশিয়াল সোশ্যাল চ্যানেলের মাধ্যমে যে-কোনো পণ্য ক্রয়ের জন্য অর্ডার প্রদান করার মাধ্যমে আপনি এই শর্তাবলীতে সম্মত হচ্ছেন বলে গণ্য হবে।",
      "আমরা যেকোনো সময় কোনো পূর্ব নোটিশ ছাড়া এই শর্তাবলী হালনাগাদ করার অধিকার সংরক্ষণ করি। সর্বশেষ সংশোধিত শর্তাবলী ওয়েবসাইটে প্রকাশের সাথে সাথে তা কার্যকর হবে।",
    ],
  },
  {
    icon: CardTick,
    title: "২. অর্ডার ও মূল্য নির্ধারণ",
    content: [
      "ওয়েবসাইটে প্রদর্শিত সকল পণ্যের মূল্য বাংলাদেশি টাকায় (BDT) উল্লিখিত এবং প্রযোজ্য ক্ষেত্রে ভ্যাট অন্তর্ভুক্ত।",
      "কাঁচামালের মৌসুমী প্রাপ্যতা এবং বাজার পরিস্থিতির ওপর ভিত্তি করে পণ্যের মূল্য পূর্ব নোটিশ ছাড়া পরিবর্তিত হতে পারে, তবে ইতিমধ্যে নিশ্চিত হওয়া অর্ডারের ক্ষেত্রে পূর্বে নিশ্চিতকৃত মূল্যই প্রযোজ্য হবে।",
      "কোনো অনিবার্য প্রযুক্তিগত কারণে কোনো পণ্যের মূল্য বা স্টকে ভুল তথ্য প্রদর্শিত হলে, অর্ডার গ্রহণের পরও গ্রাহকের সাথে আলোচনা সাপেক্ষে তা সংশোধন বা বাতিল করার অধিকার স্বাস্থ্যকর সংরক্ষণ করে।",
    ],
  },
  {
    icon: Truck,
    title: "৩. ডেলিভারি ও হ্যান্ডলিং",
    content: [
      "ঢাকা মেট্রোপলিটন এলাকায় সাধারণত ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ৩ থেকে ৫ কার্যদিবসের মধ্যে ডেলিভারি সম্পন্ন করার চেষ্টা করা হয়।",
      "প্রাকৃতিক দুর্যোগ, জাতীয় অবরোধ, কুরিয়ার জটিলতা বা অন্যান্য অনিবার্য কারণে ডেলিভারিতে বিলম্ব ঘটলে তা গ্রাহককে দ্রুত অবহিত করা হবে।",
      "গ্রাহক ক্যাশ অন ডেলিভারি (COD) সুবিধায় ডেলিভারি এজেন্টের উপস্থিতিতে প্যাকেট যাচাই করে মূল্য পরিশোধ করতে পারবেন।",
    ],
  },
  {
    icon: Refresh2,
    title: "৪. রিটার্ন, প্রতিস্থাপন ও রিফান্ড পলিসি",
    content: [
      "প্যাকেট ছেঁড়া, ক্ষতিগ্রস্ত, বা ভুল পণ্য পৌঁছালে ডেলিভারি ম্যানের উপস্থিতিতেই পণ্য ফেরত দেওয়া যাবে কিংবা গ্রহণের ৭ দিনের মধ্যে কাস্টমার কেয়ারে অবগত করে প্রতিস্থাপন নেওয়া যাবে।",
      "খাদ্যপণ্যের ক্ষেত্রে যদি পণ্যটি খোলা হয়ে থাকে এবং সিল বা মান স্বাভাবিক থাকে, কেবল ব্যক্তিগত পছন্দ না হওয়ার কারণে খাদ্যপণ্য রিটার্ন গ্রহণ করা হয় না।",
      "অনলাইন অগ্রিম পেমেন্ট করা থাকলে এবং বৈধ কারণে অর্ডার বাতিল বা রিটার্ন হলে ৩ থেকে ৭ কার্যদিবসের মধ্যে মূল পেমেন্ট মাধ্যমে সমপরিমাণ টাকা ফেরত দেওয়া হবে।",
    ],
  },
  {
    icon: ShieldSecurity,
    title: "৫. পণ্যের প্রকৃতি ও ব্যবহার",
    content: [
      "আমাদের সরবরাহকৃত মধু, সরিষার তেল ও অন্যান্য খাদ্যপণ্য সম্পূর্ণ প্রাকৃতিক। প্রাকৃতিক কারণে মধুর রঙ, গন্ধ বা ঘনত্বে সামান্য তারতম্য হতে পারে যা সম্পূর্ণ স্বাভাবিক ও নির্ভেজালতার পরিচায়ক।",
      "পণ্য সম্পর্কিত কোনো তথ্যে চিকিৎসা বা স্বাস্থ্য পরামর্শ বোঝানো হয় না। কোনো বিশেষ শারীরিক জটিলতা থাকলে বিশেষজ্ঞ চিকিৎসকের পরামর্শ অনুযায়ী খাদ্যপণ্য গ্রহণ করুন।",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="container-layout py-8 sm:py-14 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto mb-10 sm:mb-14">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          সেবা ব্যবহারের শর্তাবলী
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          সর্বশেষ হালনাগাদ: অক্টোবর ২০২৬ &bull; গ্রাহক ও প্রতিষ্ঠানের স্বচ্ছ সম্পর্কের জন্য
          শর্তসমূহ মনোযোগ সহকারে পড়ুন
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

      {/* Bottom clarification */}
      <div className="mt-10 p-5 rounded-2xl border border-border bg-muted/20 text-center text-xs text-muted-foreground">
        শর্তাবলী সংক্রান্ত কোনো জিজ্ঞাসা থাকলে অনুগ্রহ করে আমাদের{" "}
        <Link
          href="/contact"
          className="font-semibold text-emerald-600 underline underline-offset-4"
        >
          কাস্টমার কেয়ারে যোগাযোগ করুন
        </Link>
        ।
      </div>
    </div>
  );
}
