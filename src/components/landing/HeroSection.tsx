"use client";

import Image from "next/image";
import Link from "next/link";
import { type TouchEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft2, ArrowRight2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BannerSlide {
  title: string;
  highlight: string;
  subtitle: string;
  link: string;
  accentColor: string;
  image: string;
}

const HERO_SLIDES: BannerSlide[] = [
  {
    title: "১০০% খাঁটি সুন্দরবন মধু ও",
    highlight: "গাওয়া ঘি",
    subtitle:
      "প্রকৃতির নিখাদ দান, কোনো কৃত্রিম মিষ্টি বা প্রিজারভেটিভ ছাড়া সরাসরি সুন্দরবন ও খামার থেকে সংগৃহীত।",
    link: "/search?q=মধু",
    accentColor: "text-amber-400",
    image:
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1600&auto=format&fit=crop&q=85",
  },
  {
    title: "ঘানি ভাঙা সরিষার তেল ও",
    highlight: "কালোজিরা তেল",
    subtitle:
      "কাঠের ঘানিতে ভাঙা প্রাকৃতিক ঝাঁঝ ও খাঁটি পুষ্টিতে ভরপুর স্বাস্থ্যকর রান্নার শ্রেষ্ঠ উপাদান।",
    link: "/search?q=তেল",
    accentColor: "text-emerald-400",
    image:
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=1600&auto=format&fit=crop&q=85",
  },
  {
    title: "প্রিমিয়াম অর্গানিক চিয়া সিড ও",
    highlight: "সুপারফুড সংগ্রহ",
    subtitle: "প্রতিদিনের সুস্থতা ও রোগ প্রতিরোধ ক্ষমতা বৃদ্ধিতে খাঁটি সুপারফুডের সমাহার।",
    link: "/search/superfoods-wellness",
    accentColor: "text-teal-400",
    image:
      "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=1600&auto=format&fit=crop&q=85",
  },
  {
    title: "সেরা বাছাইকৃত ড্রাই ফ্রুটস ও",
    highlight: "পুষ্টিকর বাদাম",
    subtitle: "আমন্ড, কাজু, পেস্তা, আখরোট ও প্রিমিয়াম কিশমিশের সেরা স্বাস্থ্যকর স্ন্যাক্স।",
    link: "/search?q=বাদাম",
    accentColor: "text-amber-300",
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&auto=format&fit=crop&q=85",
  },
];

export function HeroSection({
  slides = HERO_SLIDES,
}: {
  slides?: BannerSlide[];
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    if (isHovered || !slides.length) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, slides.length]);

  const prevSlide = () => {
    if (!slides.length) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    if (!slides.length) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="w-full py-2 sm:py-4 md:py-5">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <section
          className="relative aspect-video w-full overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl border border-border/50 shadow-md sm:shadow-lg"
          aria-roledescription="carousel"
          aria-label="ফিচার্ড ব্যানার স্লাইডার"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {slides.map((slide, idx) => (
            <Link
              key={`${slide.title}-${idx}`}
              href={slide.link}
              className={cn(
                "absolute inset-0 block transition-opacity duration-700 ease-in-out cursor-pointer",
                idx === currentSlide
                  ? "opacity-100 z-10 pointer-events-auto"
                  : "opacity-0 z-0 pointer-events-none",
              )}
            >
              {/* Background Image */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={idx === 0}
                sizes="(min-width: 1280px) 1200px, 100vw"
                className="object-cover object-center select-none"
              />

              {/* Bottom Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Slide Content positioned at bottom */}
              <div className="relative z-20 flex h-full flex-col justify-end px-3.5 pb-4 sm:px-8 sm:pb-7 md:px-12 md:pb-9 lg:px-14 lg:pb-10 max-w-3xl text-white">
                <h1 className="text-sm sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug sm:leading-tight">
                  {slide.title}{" "}
                  <span className={slide.accentColor}>{slide.highlight}</span>
                </h1>

                <p className="mt-0.5 sm:mt-1.5 text-[10px] sm:text-xs md:text-sm lg:text-base text-neutral-200 leading-relaxed max-w-lg line-clamp-1 sm:line-clamp-2">
                  {slide.subtitle}
                </p>
              </div>
            </Link>
          ))}

          {/* Navigation Controls */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Previous slide"
            className="absolute top-1/2 left-2 sm:left-4 z-30 size-7 sm:size-9 -translate-y-1/2 rounded-full bg-black/35 text-white hover:bg-black/60 hover:text-white active:scale-90"
          >
            <ArrowLeft2 className="size-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Next slide"
            className="absolute top-1/2 right-2 sm:right-4 z-30 size-7 sm:size-9 -translate-y-1/2 rounded-full bg-black/35 text-white hover:bg-black/60 hover:text-white active:scale-90"
          >
            <ArrowRight2 className="size-4" />
          </Button>

          {/* Indicator Dots */}
          <div className="absolute bottom-2.5 sm:bottom-3.5 right-4 sm:right-10 z-30 flex items-center gap-1.5 sm:gap-2">
            {slides.map((slide, i) => (
              <button
                key={`${slide.title}-${i}`}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentSlide(i);
                }}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "h-1.5 sm:h-2 transition-all rounded-full cursor-pointer",
                  i === currentSlide
                    ? "w-6 sm:w-8 bg-emerald-500"
                    : "w-1.5 sm:w-2 bg-white/60 hover:bg-white/90",
                )}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
