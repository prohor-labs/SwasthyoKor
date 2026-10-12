"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Minus,
  Plus,
  RestartSquare,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  WhatsAppIcon,
} from "@/components/icons";
import { Prose } from "@/components/prose";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { VariantSelector } from "./VariantSelector";

export function ProductDescription({ product }: { product: Product }) {
  const { addCartItem } = useCart();
  const [quantity, setQuantity] = useState(1);


  // Initialize selectedOptions with the first variant's options
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    const initial: Record<string, string> = {};
    const defaultVariant = product.variants[0];
    if (defaultVariant) {
      for (const opt of defaultVariant.selectedOptions) {
        initial[opt.name.toLowerCase()] = opt.value;
      }
    }
    return initial;
  });

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const variant =
    product.variants.find((variant) => {
      if (variant.selectedOptions.length > 0) {
        return variant.selectedOptions.every(
          (option) =>
            selectedOptions[option.name.toLowerCase()] === option.value,
        );
      }
      return selectedOptions["পরিমাণ"] === variant.title;
    }) ?? product.variants[0];

  // ── Price / availability ──
  const currentPriceNum = Number(variant?.price.amount ?? product.priceRange.minVariantPrice.amount);
  const compareAtPriceNum = variant?.compareAtPrice?.amount
    ? Number(variant.compareAtPrice.amount)
    : undefined;

  const totalPrice = currentPriceNum * quantity;
  const productSku = `SW-${product.handle.slice(0, 6).toUpperCase()}`;

  const handleAddToCart = () => {
    if (!variant) return;
    for (let i = 0; i < quantity; i++) {
      addCartItem.mutate({ variant, product });
    }
  };

  const whatsappNumber = "8801812345678";
  const whatsappOrderMsg = encodeURIComponent(
    `আসসালামু আলাইকুম, আমি স্বাস্থ্যকর থেকে "${product.title}" (${variant?.title || "ডিফল্ট"}) ${quantity}টি অর্ডার করতে চাই। মোট মূল্য: ৳${totalPrice}।`,
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappOrderMsg}`;

  const scrollToReviews = () => {
    document
      .getElementById("reviews-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const isAvailable =
    product.availableForSale &&
    (variant?.availableForSale ?? true) &&
    (variant?.inventoryQuantity ?? 15) > 0;
  const stockQuantity = variant?.inventoryQuantity ?? 15;
  const isLowStock = isAvailable && stockQuantity <= 5;

  return (
    <>
      <div className="flex flex-col gap-4 sm:gap-5 pb-28 lg:pb-0">
        {/* ──── Section 1: Product Header ──── */}
        <div className="flex flex-col border-b border-border/25 pb-4 sm:pb-5">
          {/* SKU & Stock */}
          <div className="flex items-center justify-between gap-2 mb-1.5 text-xs text-muted-foreground">
            <span className="font-mono font-semibold">
              প্রোডাক্ট কোড: {productSku}
            </span>
            <span
                className={cn(
                  "font-bold flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px]",
                  !isAvailable
                    ? "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
                    : isLowStock
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900 animate-pulse"
                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900",
                )}
              >
                <span
                  className={cn(
                    "size-2 rounded-full",
                    !isAvailable
                      ? "bg-rose-500"
                      : isLowStock
                        ? "bg-amber-500"
                        : "bg-emerald-500 animate-pulse",
                  )}
                />
                {!isAvailable
                  ? "স্টক শেষ (Out of Stock)"
                  : isLowStock
                    ? `⚡ মাত্র ${stockQuantity}টি বাকি আছে!`
                    : `ইন স্টক (${stockQuantity}টি স্টকে আছে)`}
              </span>
          </div>


          {/* Product Title */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-snug">
            {product.title}
          </h1>

          {/* Ratings & Reviews */}
          <div className="mt-2.5 flex items-center gap-3 flex-wrap text-xs">
            {product.rating && product.rating > 0 ? (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn(
                      "size-3.5",
                      s <= Math.round(product.rating ?? 0)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted-foreground/30",
                    )}
                  />
                ))}
                <span className="ml-1 font-extrabold text-foreground">
                  {product.rating.toFixed(1)} / ৫.০
                </span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={scrollToReviews}
              className="text-muted-foreground hover:text-emerald-600 transition-colors cursor-pointer font-medium underline underline-offset-4"
            >
              {product.reviewCount && product.reviewCount > 0
                ? `(${product.reviewCount.toLocaleString("bn-BD")}টি ভেরিফাইড রিভিউ)`
                : "রিভিউ ও মতামত দেখুন"}
            </button>
          </div>

          {/* Dynamic Price Display */}
          <div className="mt-3.5 flex flex-wrap items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              ৳{currentPriceNum.toLocaleString("bn-BD")}
            </span>
            {compareAtPriceNum && compareAtPriceNum > currentPriceNum && (
              <>
                <span className="text-sm sm:text-base text-muted-foreground line-through decoration-rose-500/70 font-semibold font-mono">
                  ৳{compareAtPriceNum.toLocaleString("bn-BD")}
                </span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  ৳
                  {(compareAtPriceNum - currentPriceNum).toLocaleString(
                    "bn-BD",
                  )}{" "}
                  সাশ্রয়
                </span>
              </>
            )}
          </div>
        </div>

        {/* ──── Section 2: Variant Selector ──── */}
        <VariantSelector
          options={product.options}
          variants={product.variants}
          selectedOptions={selectedOptions}
          onOptionSelect={handleOptionSelect}
        />

        {/* ──── Section 3: Quantity Stepper ──── */}
        <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-bold text-foreground">অর্ডার সংখ্যা:</span>
              <div className="flex items-center rounded-xl border border-border bg-card p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={!isAvailable || quantity <= 1}
                  className="flex size-7 items-center justify-center rounded-lg hover:bg-muted active:scale-95 disabled:opacity-40 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-3.5 text-foreground" />
                </button>
                <span className="w-9 text-center text-xs font-bold text-foreground font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(Math.max(1, stockQuantity), q + 1))
                  }
                  disabled={!isAvailable || quantity >= stockQuantity}
                  className="flex size-7 items-center justify-center rounded-lg hover:bg-muted active:scale-95 disabled:opacity-40 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-3.5 text-foreground" />
                </button>
              </div>
              {quantity > 1 && (
                <span className="text-xs text-muted-foreground font-medium">
                  মোট: ৳{totalPrice.toLocaleString("bn-BD")}
                </span>
              )}
              {isLowStock && (
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  (সর্বোচ্চ {stockQuantity}টি নিতে পারবেন)
                </span>
              )}
            </div>


        {/* ──── Section 4: Description ──── */}
        {product.descriptionHtml ? (
          <Prose
            className="text-xs sm:text-sm leading-relaxed sm:leading-loose text-muted-foreground/90"
            html={product.descriptionHtml}
          />
        ) : product.description ? (
          <div className="text-xs sm:text-sm leading-relaxed sm:leading-loose text-muted-foreground/90 whitespace-pre-line">
            {product.description}
          </div>
        ) : null}

        {/* ──── Section 5: Product Meta Specs ──── */}
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/40 bg-muted/15 p-3.5 sm:p-4 text-xs">
          <div>
            <span className="text-muted-foreground">ব্র্যান্ড: </span>
            <span className="font-bold text-foreground">
              {product.brand || "স্বাস্থ্যকর (SwasthyoKor)"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">ক্যাটাগরি: </span>
            {product.category ? (
              <Link
                href={`/search/${product.category.handle}`}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {product.category.title}
              </Link>
            ) : (
              <span className="font-bold text-foreground">অর্গানিক ফুড</span>
            )}
          </div>
          <div>
            <span className="text-muted-foreground">পণ্য ধরন: </span>
            <span className="font-bold text-foreground">
              {product.productType || "১০০% প্রাকৃতিক খাদ্য"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">ডেলিভারি: </span>
            <span className="font-bold text-foreground">
              {product.deliveryInfo || "সারা দেশে দ্রুত হোম ডেলিভারি"}
            </span>
          </div>
        </div>

        {/* ──── Section 6: Desktop CTAs ──── */}
        <div className="hidden lg:flex flex-col gap-2.5 pt-2">
          <Button
            render={
              <Link href={`/checkout/${product.handle}?quantity=${quantity}`}>
                সরাসরি অর্ডার করুন — ৳{totalPrice.toLocaleString("bn-BD")}
              </Link>
            }
            size="lg"
            className="w-full rounded-xl bg-emerald-600 text-sm sm:text-base font-bold text-white shadow-md hover:bg-emerald-500 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:cursor-not-allowed h-12"
            disabled={!isAvailable}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Add To Cart */}
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-xl border-border text-xs sm:text-sm font-bold disabled:cursor-not-allowed h-11"
              disabled={!isAvailable || addCartItem.isPending}
              onClick={handleAddToCart}
            >
              {addCartItem.isPending ? (
                <Spinner className="size-4 text-current" />
              ) : (
                <ShoppingBag className="size-4 text-emerald-600" />
              )}
              {isAvailable
                ? addCartItem.isPending
                  ? "যোগ হচ্ছে..."
                  : "কার্টে যোগ করুন"
                : "স্টক শেষ"}
            </Button>

            {/* WhatsApp 1-Click Order */}
            <Button
              render={
                <Link
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              variant="outline"
              size="lg"
              className="w-full rounded-xl border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs sm:text-sm font-bold h-11"
            >
              <WhatsAppIcon className="size-4.5 shrink-0" />
              <span>হোয়াটসঅ্যাপ অর্ডার</span>
            </Button>
          </div>

          <p className="text-[11px] text-center text-muted-foreground pt-1">
            🔒 ১০০% নিরাপদ অনলাইন পেমেন্ট (বিকাশ/নগদ/কার্ড) • ১০০% খাঁটি পণ্য নিশ্চয়তা
          </p>
        </div>

        {/* ──── Section 7: Trust Badges ──── */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/25 text-center">
          <div className="flex flex-col items-center justify-between rounded-xl p-2.5 bg-muted/20 min-h-[84px]">
            <Truck className="size-4.5 text-emerald-600 shrink-0 mb-1" />
            <div className="flex flex-col gap-0.5 justify-center flex-1">
              <span className="text-[11px] font-bold text-foreground leading-tight">
                দ্রুত ডেলিভারি
              </span>
              <span className="text-[9.5px] text-muted-foreground leading-tight">
                সারাদেশে ২-৩ দিন
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between rounded-xl p-2.5 bg-muted/20 min-h-[84px]">
            <ShieldCheck className="size-4.5 text-emerald-600 shrink-0 mb-1" />
            <div className="flex flex-col gap-0.5 justify-center flex-1">
              <span className="text-[11px] font-bold text-foreground leading-tight">
                খাঁটি ও নিরাপদ
              </span>
              <span className="text-[9.5px] text-muted-foreground leading-tight">
                প্রাকৃতিক উপাদান
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between rounded-xl p-2.5 bg-muted/20 min-h-[84px]">
            <RestartSquare className="size-4.5 text-emerald-600 shrink-0 mb-1" />
            <div className="flex flex-col gap-0.5 justify-center flex-1">
              <span className="text-[11px] font-bold text-foreground leading-tight">
                নিরাপদ পেমেন্ট
              </span>
              <span className="text-[9.5px] text-muted-foreground leading-tight">
                বিকাশ, নগদ ও কার্ড
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ──── Sticky Bottom Action Bar — Mobile Only ──── */}
      <div className="fixed bottom-0 inset-x-0 z-30 lg:hidden">
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          {/* Price + Quantity summary line */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                ৳{totalPrice.toLocaleString("bn-BD")}
              </span>
            </div>

            {/* Pack quantity stepper */}
            <div className="flex items-center rounded-lg border border-border bg-card p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="flex size-7 items-center justify-center rounded-md hover:bg-muted active:scale-95 disabled:opacity-40 cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-7 text-center text-xs font-bold font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex size-7 items-center justify-center rounded-md hover:bg-muted active:scale-95 cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Action buttons row */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 rounded-xl border-border h-11 px-3 font-bold disabled:cursor-not-allowed"
              disabled={!isAvailable || addCartItem.isPending}
              onClick={handleAddToCart}
            >
              {addCartItem.isPending ? (
                <Spinner className="size-4 text-current" />
              ) : (
                <ShoppingBag className="size-4 text-emerald-600" />
              )}
              <span className="sr-only sm:not-sr-only">কার্ট</span>
            </Button>

            <Button
              render={
                <Link href={`/checkout/${product.handle}?quantity=${quantity}`}>
                  সরাসরি অর্ডার — ৳{totalPrice.toLocaleString("bn-BD")}
                </Link>
              }
              size="lg"
              className="flex-1 rounded-xl bg-emerald-600 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-emerald-500 active:scale-[0.99] transition-all disabled:cursor-not-allowed h-11"
              disabled={!isAvailable}
            />
          </div>
        </div>
      </div>
    </>
  );
}
