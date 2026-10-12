"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  ShieldCheck,
  TrendUp,
  Truck,
  WhatsAppIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";

const RESELLER_BENEFITS = [
  {
    icon: TrendUp,
    title: "পাইকারি মূল্য সুবিধা",
    desc: "সর্বোচ্চ মার্জিনে খাঁটি পণ্য সংগ্রহ",
  },
  {
    icon: ShieldCheck,
    title: "খাঁটি ও প্রাকৃতিক পণ্য",
    desc: "নিরাপদ ও নিজস্ব তত্ত্বাবধানে প্রস্তুত",
  },
  {
    icon: Truck,
    title: "সারা দেশে ড্রপশিপিং",
    desc: "আপনার কাস্টমারের কাছে দ্রুত ডেলিভারি",
  },
];

export function ResellerBanner() {
  const whatsappNumber = "8801812345678";
  const whatsappMessage = encodeURIComponent(
    "আসসালামু আলাইকুম, আমি স্বাস্থ্যকর-এর উদ্যোক্তা / রিসেলার প্রোগ্রামে যুক্ত হতে আগ্রহী। বিস্তারিত তথ্য জানতে চাই।",
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <section id="reseller" className="w-full py-10 sm:py-14 md:py-18">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-neutral-900 via-stone-900 to-emerald-950 p-6 sm:p-10 md:p-14 text-white shadow-xl">
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 size-80 rounded-full bg-amber-500/10 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <h2 className="mb-3 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl text-white leading-tight">
                স্বাস্থ্যকর পণ্যের সাথে গড়ে তুলুন <br className="hidden sm:inline" />
                <span className="text-emerald-400">নিজের সফল ব্যবসা</span>
              </h2>

              <p className="mb-6 text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed max-w-xl">
                সীমিত অথবা জিরো পুঁজিতে স্বাস্থ্যকর-এর সাথে যুক্ত হয়ে আপনার এলাকায় বা অনলাইনে
                খাঁটি অর্গানিক খাদ্যের ব্যবসা শুরু করুন। আমরা দিচ্ছি পাইকারি রেট এবং সার্বিক
                সাপোর্ট।
              </p>

              {/* Benefits Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
                {RESELLER_BENEFITS.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div
                      key={b.title}
                      className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs transition-colors hover:border-emerald-500/30"
                    >
                      <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">
                          {b.title}
                        </h4>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {b.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right CTA Box */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
              <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md text-center">
                <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
                  আজই শুরু করুন
                </h3>
                <p className="text-xs text-neutral-300 mb-5">
                  আমাদের বিজনেস টিমের সাথে সরাসরি কথা বলতে হোয়াটসঅ্যাপে মেসেজ দিন
                </p>

                <Button
                  render={
                    <Link
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                  size="lg"
                  className="w-full rounded-xl bg-emerald-500 font-bold text-white shadow-lg hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <WhatsAppIcon data-icon="inline-start" className="size-5" />
                  <span>হোয়াটসঅ্যাপে যোগাযোগ করুন</span>
                  <ArrowUpRight data-icon="inline-end" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
