import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { getCollectionProducts, getCollections } from "@/lib/db/queries";

export const metadata = {
  title: "ক্যাটাগরি সমূহ | স্বাস্থ্যকর",
  description: "স্বাস্থ্যকর এর সকল অর্গানিক খাদ্য ও ভেষজ পণ্যের ক্যাটাগরি তালিকা।",
};

const CATEGORY_META: Record<string, { image: string; icon: string }> = {
  "organic-essentials": {
    image:
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80",
    icon: "🍯",
  },
  "oils-and-ghee": {
    image:
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80",
    icon: "🫒",
  },
  "superfoods-wellness": {
    image:
      "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=800&auto=format&fit=crop&q=80",
    icon: "🌿",
  },
  "nuts-dry-fruits": {
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80",
    icon: "🥜",
  },
};

export default async function CategoriesPage() {
  const allCollections = await getCollections();
  const visibleCollections = allCollections.filter(
    (c) => !c.handle.startsWith("hidden-"),
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12 flex flex-col gap-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-900 to-neutral-900 p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-300 backdrop-blur-md">
              ১০০% প্রাকৃতিক ও অর্গানিক
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1">
            পণ্য ক্যাটাগরি ডিরেক্টরি
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            আপনার পছন্দের খাঁটি মধু, তেল, ঘি, বাদাম ও সুপারফুডের ক্যাটাগরি ব্রাউজ করুন।
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {visibleCollections.map(async (collection) => {
          const prods = await getCollectionProducts({
            collection: collection.handle,
          });
          const meta = CATEGORY_META[collection.handle] || {
            image:
              "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
            icon: "🌿",
          };
          const imageSrc = collection.image || meta.image;

          return (
            <Link
              key={collection.handle}
              href={`/category/${collection.handle}`}
              className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs transition-all duration-300 hover:border-emerald-500/60 hover:shadow-xl flex flex-col sm:flex-row h-full min-h-[220px]"
            >
              {/* Image Side */}
              <div className="relative w-full sm:w-2/5 h-48 sm:h-auto overflow-hidden bg-muted">
                <Image
                  src={imageSrc}
                  alt={collection.title}
                  fill
                  sizes="(min-width: 1024px) 300px, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/60 via-transparent to-transparent sm:hidden" />
                <span className="absolute bottom-3 left-3 sm:top-3 sm:left-3 text-2xl drop-shadow-md">
                  {meta.icon}
                </span>
              </div>

              {/* Content Side */}
              <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 gap-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                      {prods.length}টি পণ্য উপলব্ধ
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-foreground group-hover:text-emerald-600 transition-colors">
                    {collection.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                    {collection.description ||
                      "১০০% খাঁটি ও সেরা মানের অর্গানিক খাদ্য উপাদান।"}
                  </p>
                </div>

                <div className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>পণ্যসমূহ ব্রাউজ করুন</span>
                  <ArrowRight className="size-4 ml-1.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
