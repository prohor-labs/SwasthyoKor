import { Award, RestartCircle, ShieldCheck, Truck } from "@/components/icons";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "প্রাকৃতিক ও ভেজালমুক্ত পণ্য",
    description: "কোনো ক্ষতিকর উপাদান ছাড়া সম্পূর্ণ প্রাকৃতিক ও স্বাস্থ্যসম্মত খাদ্যপণ্য",
  },
  {
    icon: Truck,
    title: "দেখে নেওয়ার ক্যাশ অন ডেলিভারি",
    description: "ঢাকা ও সারা দেশে পণ্য হাতে পেয়ে যাচাই করে মূল্য পরিশোধ (COD) সুবিধা",
  },
  {
    icon: RestartCircle,
    title: "ঝামেলাহীন রিটার্ন ও রিফান্ড",
    description: "পছন্দ বা মানে কোনো সমস্যা হলে ৭ দিনের মধ্যে নিশ্চিত মান গ্যারান্টি",
  },
  {
    icon: Award,
    title: "সরাসরি তৃণমূল থেকে সংগৃহীত",
    description: "সুন্দরবনের মৌয়াল ও গ্রামীণ ঘানি থেকে সরাসরি সংগৃহীত খাঁটি খাদ্যপণ্য",
  },
];

export function TrustFeaturesBar() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {FEATURES.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex items-start gap-3.5 rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs transition-all hover:border-emerald-500/40"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Icon className="size-6" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
