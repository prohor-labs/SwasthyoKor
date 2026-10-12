"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowLeft2, ArrowRight2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export function Gallery({
  images,
}: {
  images: { src: string; altText: string }[];
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const onThumbClick = (index: number) => {
    if (!api) return;
    api.scrollTo(index);
  };

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square size-full max-h-[480px] overflow-hidden rounded-2xl md:rounded-3xl border border-border/40 bg-muted/20" />
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full">
      {/* Main Image Carousel */}
      <div className="relative w-full">
        <Carousel
          setApi={setApi}
          opts={{ loop: true }}
          className="w-full overflow-hidden rounded-2xl md:rounded-3xl border border-border/60 bg-card shadow-xs"
        >
          <CarouselContent className="ml-0">
            {images.map((image, index) => (
              <CarouselItem key={image.src} className="pl-0">
                <div className="relative aspect-square size-full max-h-[440px] sm:max-h-[500px] overflow-hidden bg-muted/30">
                  <Image
                    className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    alt={image.altText || "Product Image"}
                    src={image.src}
                    priority={index === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Arrows on Main Image */}
          {images.length > 1 && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => api?.scrollPrev()}
                aria-label="Previous image"
                className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 size-8 sm:size-9 rounded-full bg-white/90 text-neutral-800 hover:bg-white hover:text-neutral-900 dark:bg-neutral-900/90 dark:text-white dark:hover:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 backdrop-blur-md shadow-xs active:scale-90 cursor-pointer"
              >
                <ArrowLeft2 className="size-4 sm:size-5" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => api?.scrollNext()}
                aria-label="Next image"
                className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 size-8 sm:size-9 rounded-full bg-white/90 text-neutral-800 hover:bg-white hover:text-neutral-900 dark:bg-neutral-900/90 dark:text-white dark:hover:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 backdrop-blur-md shadow-xs active:scale-90 cursor-pointer"
              >
                <ArrowRight2 className="size-4 sm:size-5" />
              </Button>
            </>
          )}
        </Carousel>
      </div>

      {/* Interactive Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto py-1 [scrollbar-width:none]">
          {images.map((image, index) => {
            const isActive = index === current;

            return (
              <button
                key={image.src}
                type="button"
                onClick={() => onThumbClick(index)}
                aria-label={`Go to image ${index + 1}`}
                className={cn(
                  "relative size-14 sm:size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-pointer bg-muted",
                  isActive
                    ? "border-emerald-600 shadow-xs scale-105 ring-2 ring-emerald-500/20"
                    : "border-border/60 opacity-60 hover:opacity-100 hover:border-emerald-500/50",
                )}
              >
                <Image
                  alt={image.altText || `Thumbnail ${index + 1}`}
                  src={image.src}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
