import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CallCalling,
  HelpCircle,
  Sparkles,
} from "@/components/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GENERAL_FAQS } from "@/lib/content/blog-data";
import { getStoreSettings } from "@/lib/db/queries";
import { baseUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ) | স্বাস্থ্যকর",
  description:
    "স্বাস্থ্যকর (SwasthyoKor) পণ্যের বিশুদ্ধতা, ডেলিভারি সিস্টেম, পেমেন্ট ও রিটার্ন সম্পর্কিত সকল প্রশ্নের স্পষ্ট উত্তর।",
  alternates: {
    canonical: `${baseUrl}/faq`,
  },
  openGraph: {
    title: "সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ) | স্বাস্থ্যকর",
    description:
      "স্বাস্থ্যকর (SwasthyoKor) পণ্যের বিশুদ্ধতা, ডেলিভারি সিস্টেম, পেমেন্ট ও রিটার্ন সম্পর্কিত সকল প্রশ্নের স্পষ্ট উত্তর।",
    url: `${baseUrl}/faq`,
    type: "website",
  },
};

export default async function FAQPage() {
  const settings = await getStoreSettings();
  const allFaqs = GENERAL_FAQS.flatMap((cat) => cat.items);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <div className="container-layout py-8 sm:py-12 max-w-4xl">
        <div className="mb-10 text-center flex flex-col items-center gap-3">
          <Badge variant="secondary" className="gap-1.5 px-3 py-1">
            <HelpCircle data-icon="inline-start" />
            <span>সহায়তা কেন্দ্র & সাধারণ জিজ্ঞাসা</span>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            স্বাস্থ্যকর (SwasthyoKor) থেকে অর্ডার, পণ্যের গুণগত মান, ডেলিভারি ও লেনদেন
            সংক্রান্ত সব তথ্যের স্পষ্ট উত্তর।
          </p>
        </div>

        {/* Categorized FAQs with shadcn Accordion */}
        <div className="flex flex-col gap-6">
          {GENERAL_FAQS.map((categoryGroup) => (
            <Card
              key={categoryGroup.category}
              className="overflow-hidden py-0 p-0"
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-lg font-bold tracking-tight text-foreground">
                    {categoryGroup.category}
                  </h2>
                </div>
                <Accordion>
                  {categoryGroup.items.map((item) => (
                    <AccordionItem key={item.question} value={item.question}>
                      <AccordionTrigger className="text-left font-semibold text-foreground py-3.5">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pb-3">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support CTA Card */}
        <Card className="mt-10 border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/20 text-center py-0 p-0">
          <CardContent className="p-6 sm:p-8 flex flex-col items-center justify-center">
            <div className="size-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
              <CallCalling className="size-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">
              আপনার প্রশ্নের উত্তর খুঁজে পাননি?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-6">
              আমাদের কাস্টমার কেয়ার টিম সবসময় আপনার সহায়তায় প্রস্তুত। সরাসরি কল বা হোয়াটসঅ্যাপে
              মেসেজ দিন।
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                render={
                  <a href={`tel:${settings.storePhone || "01812345678"}`}>
                    <CallCalling data-icon="inline-start" />
                    সরাসরি কল করুন
                  </a>
                }
              />
              <Button
                variant="outline"
                render={
                  <Link href="/blog">
                    স্বাস্থ্য ব্লগ পড়ুন
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
