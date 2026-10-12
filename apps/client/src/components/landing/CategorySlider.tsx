"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft2, ArrowRight2 } from "@/components/icons";
import { Button } from "@/components/ui/button";

export interface CategoryItem {
  id?: string;
  name: string;
  nameEn?: string;
  image: string;
  href: string;
}

interface CategorySliderProps {
  categories?: CategoryItem[];
  title?: string;
  subtitle?: string;
}

export function CategorySlider({
  categories = [],
  title = "জনপ্রিয় ক্যাটাগরি",
  subtitle = "আপনার পছন্দের ক্যাটাগরি থেকে সহজে কেনাকাটা করুন",
}: CategorySliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!categories || categories.length === 0) {
    return null;
  }

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const offset = direction === "left" ? -280 : 280;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <section className="relative w-full border-b border-border/50 bg-muted/20 py-4 sm:py-7">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        {/* Header with Title and Navigation Controls */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl md:text-2xl">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-muted-foreground sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>

          {/* Navigation Arrows using shadcn Button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              aria-label="Previous categories"
              className="size-8 sm:size-9 rounded-full bg-background/90"
            >
              <ArrowLeft2 className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              aria-label="Next categories"
              className="size-8 sm:size-9 rounded-full bg-background/90"
            >
              <ArrowRight2 className="size-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Categories Row */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-2 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-6"
        >
          {categories.map((category, index) => (
            <Link
              key={`${category.name}-${index}`}
              href={category.href}
              className="group flex flex-col items-center text-center shrink-0 w-[88px] sm:w-[104px] md:w-[116px] transition-transform duration-200"
            >
              {/* Category Image Circle */}
              <div className="relative size-[76px] sm:size-[92px] md:size-[100px] overflow-hidden rounded-full border-2 border-emerald-100/80 bg-card p-1 shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:border-emerald-600 group-hover:shadow-sm dark:border-emerald-950/80">
                <div className="relative size-full overflow-hidden rounded-full bg-muted">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(min-width: 768px) 100px, 80px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Category Name */}
              <div className="mt-2 flex flex-col items-center">
                <span className="line-clamp-2 text-xs font-semibold text-foreground/90 transition-colors duration-200 group-hover:text-emerald-600 sm:text-[13px] dark:group-hover:text-emerald-400">
                  {category.name}
                </span>
                {category.nameEn && (
                  <span className="hidden text-[10px] text-muted-foreground sm:inline-block">
                    {category.nameEn}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
