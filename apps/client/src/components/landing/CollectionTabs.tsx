import Link from "next/link";
import { Suspense } from "react";
import { Carousel } from "@/components/carousel";
import { Button } from "@/components/ui/button";
export function CollectionTabsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12">
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row sm:mb-8">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl md:text-3xl">
            সকল অর্গানিক পণ্য ও সুপারফুড
          </h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            সেরা কোয়ালিটির বাছাইকৃত পণ্য সম্ভার
          </p>
        </div>
        <Button
          render={<Link href="/search" />}
          variant="outline"
          size="sm"
          className="rounded-full font-semibold"
        >
          সব পণ্য দেখুন
        </Button>
      </div>

      {/* Carousel */}
      <Suspense
        fallback={
          <div className="flex w-full animate-pulse gap-3 sm:gap-4 overflow-hidden px-3 sm:px-4 py-2">
            <div className="h-[210px] sm:h-[260px] w-[68vw] sm:w-1/3 rounded-2xl bg-muted/60" />
            <div className="h-[210px] sm:h-[260px] w-[68vw] sm:w-1/3 rounded-2xl bg-muted/60" />
            <div className="h-[210px] sm:h-[260px] w-[68vw] sm:w-1/3 rounded-2xl bg-muted/60" />
          </div>
        }
      >
        <Carousel />
      </Suspense>
    </section>
  );
}
