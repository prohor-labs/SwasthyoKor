import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons";
import { Call, Clock, Location, ShieldCheck, Sms } from "reicon-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/config";
import { baseUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "যোগাযোগ | স্বাস্থ্যকর (SwasthyoKor)",
  description:
    "স্বাস্থ্যকর-এর সাথে সরাসরি যোগাযোগ করুন। ফোন, হোয়াটসঅ্যাপ, ইমেইল বা আমাদের ঠিকানায় বার্তা পাঠিয়ে যেকোনো তথ্য বা পরামর্শ নিন।",
  alternates: {
    canonical: `${baseUrl}/contact`,
  },
  openGraph: {
    title: "যোগাযোগ | স্বাস্থ্যকর (SwasthyoKor)",
    description:
      "স্বাস্থ্যকর-এর সাথে সরাসরি যোগাযোগ করুন। ফোন, হোয়াটসঅ্যাপ, ইমেইল বা আমাদের ঠিকানায় বার্তা পাঠিয়ে যেকোনো তথ্য বা পরামর্শ নিন।",
    url: `${baseUrl}/contact`,
    type: "website",
  },
};

export default function ContactPage() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    "আসসালামু আলাইকুম, স্বাস্থ্যকর থেকে পণ্য ও সেবা সম্পর্কিত তথ্য জানতে চাচ্ছি।",
  )}`;

  return (
    <div className="container-layout py-8 sm:py-14 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto mb-10 sm:mb-14">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          আমরা আপনার সহায়তায় প্রস্তুত
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          পণ্য নির্বাচন, অর্ডার ট্র্যাকিং, বাল্ক অর্ডার কিংবা কোনো অভিযোগ থাকলে নির্দ্বিধায় আমাদের
          জানান। আমরা দ্রুততম সময়ে সমাধান প্রদান করি।
        </p>
      </div>

      {/* Main Grid: Channels + Working hours & Policy */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
        {/* WhatsApp Card */}
        <Card className="border-border/80 hover:border-emerald-500/60 transition-all shadow-2xs group py-0 [--card-spacing:0px]">
          <CardContent className="p-5 sm:p-6 flex flex-col h-full justify-between gap-4">
            <div className="space-y-3">
              <div className="size-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                <WhatsAppIcon className="size-6" />
              </div>
              <h2 className="font-bold text-lg text-foreground">
                হোয়াটসঅ্যাপ সাপোর্ট
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                তাৎক্ষণিক উত্তর ও সরাসরি পরামর্শের জন্য আমাদের অফিশিয়াল হোয়াটসঅ্যাপে নক করুন।
              </p>
            </div>
            <Button
              render={
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="size-4.5" />
                  <span>হোয়াটসঅ্যাপে মেসেজ দিন</span>
                </a>
              }
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl gap-2 font-medium"
            />
          </CardContent>
        </Card>

        {/* Direct Call Card */}
        <Card className="border-border/80 hover:border-emerald-500/60 transition-all shadow-2xs group py-0 [--card-spacing:0px]">
          <CardContent className="p-5 sm:p-6 flex flex-col h-full justify-between gap-4">
            <div className="space-y-3">
              <div className="size-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                <Call className="size-5" />
              </div>
              <h2 className="font-bold text-lg text-foreground">
                সরাসরি ফোন কল
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                অর্ডার সংক্রান্ত যেকোনো জরুরি তথ্যের জন্য কাস্টমার কেয়ারে কল করুন।
              </p>
              <div className="text-sm font-semibold font-mono text-foreground">
                {siteConfig.supportPhone}
              </div>
            </div>
            <Button
              render={
                <a href={`tel:${siteConfig.supportPhone}`}>
                  <Call className="size-4" />
                  <span>সরাসরি কল করুন</span>
                </a>
              }
              variant="outline"
              className="w-full rounded-xl gap-2 font-medium"
            />
          </CardContent>
        </Card>

        {/* Email Support Card */}
        <Card className="border-border/80 hover:border-emerald-500/60 transition-all shadow-2xs group py-0 [--card-spacing:0px]">
          <CardContent className="p-5 sm:p-6 flex flex-col h-full justify-between gap-4">
            <div className="space-y-3">
              <div className="size-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 border border-purple-200 dark:border-purple-800 flex items-center justify-center">
                <Sms className="size-5" />
              </div>
              <h2 className="font-bold text-lg text-foreground">
                ইমেইল যোগাযোগ
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                অফিশিয়াল বা করপোরেট প্রপোজাল পাঠাতে আমাদের সাপোর্টে ইমেইল করুন।
              </p>
              <div className="text-xs sm:text-sm font-semibold text-foreground truncate">
                {siteConfig.supportEmail}
              </div>
            </div>
            <Button
              render={
                <a href={`mailto:${siteConfig.supportEmail}`}>
                  <Sms className="size-4" />
                  <span>ইমেইল পাঠান</span>
                </a>
              }
              variant="outline"
              className="w-full rounded-xl gap-2 font-medium"
            />
          </CardContent>
        </Card>
      </div>

      {/* Info Sections: Office Address + Operating Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-12">
        <div className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-3">
          <div className="flex items-center gap-2 text-foreground font-semibold text-base">
            <Location className="size-5 text-emerald-600" />
            <span>অফিসের ঠিকানা</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {siteConfig.address}
          </p>
          <p className="text-xs text-muted-foreground">
            (অফিস ভিজিট করার পূর্বে অনুগ্রহ করে ফোনে যোগাযোগ করে আসুন)
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-3">
          <div className="flex items-center gap-2 text-foreground font-semibold text-base">
            <Clock className="size-5 text-emerald-600" />
            <span>সাপোর্ট ও ডেলিভারির সময়সূচী</span>
          </div>
          <ul className="text-xs sm:text-sm text-muted-foreground space-y-1.5">
            <li>
              <strong className="text-foreground">হটলাইন ও চ্যাট:</strong> সকাল ৯:০০
              - রাত ১০:০০ (প্রতিদিন)
            </li>
            <li>
              <strong className="text-foreground">ডেলিভারি হ্যান্ডওভার:</strong>{" "}
              প্রতিদিন বিকেল ৫:০০ টার মধ্যে
            </li>
            <li>
              <strong className="text-foreground">ছুটির দিন:</strong> শুক্রবার শুধুমাত্র
              অনলাইন অর্ডার গ্রহণ ও হোয়াটসঅ্যাপ চ্যাট সচল থাকে
            </li>
          </ul>
        </div>
      </div>

      {/* Trust & FAQ Link Banner */}
      <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border/80 bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-foreground">
              সাধারণ কোনো প্রশ্ন রয়েছে?
            </h3>
            <p className="text-xs text-muted-foreground">
              আমাদের পণ্যের মান, ডেলিভারি বা রিটার্ন পলিসি সংক্রান্ত বিস্তারিত জানতে FAQ
              দেখুন।
            </p>
          </div>
        </div>
        <Button
          render={<Link href="/faq">FAQ পেইজ দেখুন</Link>}
          variant="outline"
          className="rounded-full shrink-0"
        />
      </div>
    </div>
  );
}
