import { Suspense } from "react";
import { ThreeItemGrid } from "@/components/grid";

const categories = [
  { label: "সব পণ্য", path: "/search" },
  { label: "আম", path: "/search?q=আম" },
  { label: "মধু", path: "/search?q=মধু" },
  { label: "প্যান্ট্রি", path: "/search/organic-essentials" },
  { label: "হেলথ", path: "/search/superfoods-wellness" },
];

function BentoShowcase() {
  return (
    <section
      id="collection-section"
      className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12"
    >
      <div className="mb-8 text-center sm:mb-10">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          আমাদের কালেকশন
        </h2>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat, idx) => (
            <a
              key={cat.label}
              href={cat.path}
              className={`rounded-full px-5 py-2 text-xs font-bold transition-all border ${
                idx === 0
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-background text-neutral-600 border-neutral-300 hover:border-neutral-400 dark:text-neutral-300 dark:border-neutral-700"
              }`}
            >
              {cat.label}
            </a>
          ))}
        </div>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-3 sm:gap-4 md:grid-cols-6 md:grid-rows-2">
            <div className="h-[280px] sm:h-[380px] md:h-[480px] rounded-2xl bg-muted/60 md:col-span-4 md:row-span-2 animate-pulse" />
            <div className="h-[180px] sm:h-[220px] rounded-2xl bg-muted/60 md:col-span-2 md:row-span-1 animate-pulse" />
            <div className="h-[180px] sm:h-[220px] rounded-2xl bg-muted/60 md:col-span-2 md:row-span-1 animate-pulse" />
          </div>
        }
      >
        <ThreeItemGrid />
      </Suspense>
    </section>
  );
}
