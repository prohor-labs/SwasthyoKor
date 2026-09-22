"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { BagShopping, Star } from "@/components/icons";
import Price from "@/components/price";
import { ResponsiveDialog } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCart } from "@/hooks/use-cart";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Product } from "@/lib/types";

interface ProductQuickViewProps {
  product: Product;
  children: React.ReactNode;
  className?: string;
}

export function ProductQuickView({
  product,
  children,
  className,
}: ProductQuickViewProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const { addCartItem } = useCart();

  const defaultVariant = product.variants?.[0];
  const stockQuantity = defaultVariant?.inventoryQuantity ?? 15;

  const isAvailable =
    product.availableForSale &&
    (defaultVariant?.availableForSale ?? true) &&
    stockQuantity > 0;

  const isLowStock = isAvailable && stockQuantity <= 5;
  const stockLabel = `⚡ মাত্র ${stockQuantity}টি বাকি`;
  const checkoutHref = `/checkout/${product.handle}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!defaultVariant) return;
    addCartItem.mutate(
      { variant: defaultVariant, product },
      {
        onSuccess: () => {
          setOpen(false);
        },
      },
    );
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Intercept and open Drawer on mobile screen
    if (
      typeof window !== "undefined" &&
      (window.innerWidth < 768 || isMobile)
    ) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(true);
    }
  };

  return (
    <>
      <div onClickCapture={handleCardClick} className={className}>
        {children}
      </div>

      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        className="max-h-[85vh]"
      >
        <div className="flex flex-col gap-4">
          {/* Product Header: Image & Main Info */}
          <div className="flex items-center gap-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-neutral-100 dark:bg-neutral-900">
              {product.featuredImage?.url ? (
                <Image
                  src={product.featuredImage.url}
                  alt={product.title}
                  fill
                  sizes="80px"
                  className="size-full object-cover"
                />
              ) : null}
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1 text-[10px] text-amber-500 font-bold">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                <span>
                  {product.rating && product.rating > 0
                    ? product.rating.toFixed(1)
                    : "৫.০"}
                </span>
                <span className="text-muted-foreground font-normal">
                  (
                  {product.reviewCount && product.reviewCount > 0
                    ? `${product.reviewCount.toLocaleString("bn-BD")}টি রিভিউ`
                    : "খাঁটি মান"}
                  )
                </span>
              </div>
              <h3 className="line-clamp-2 text-sm sm:text-base font-bold text-foreground">
                {product.title}
              </h3>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  <Price
                    amount={
                      defaultVariant?.price.amount ??
                      product.priceRange.minVariantPrice.amount
                    }
                    currencyCode={
                      defaultVariant?.price.currencyCode ??
                      product.priceRange.minVariantPrice.currencyCode
                    }
                  />
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    !isAvailable
                      ? "bg-rose-500/10 text-rose-500"
                      : isLowStock
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {!isAvailable
                    ? "স্টক শেষ"
                    : isLowStock
                      ? stockLabel
                      : "ইন স্টক"}
                </span>
              </div>
            </div>
          </div>

          {/* Description snippet */}
          {product.description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <Button
              render={
                <Link href={checkoutHref}>সরাসরি অর্ডার করুন</Link>
              }
              size="lg"
              className="w-full rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed shadow-xs h-11 text-sm cursor-pointer"
              disabled={!isAvailable}
              onClick={() => setOpen(false)}
            />

            {/* Cart button */}
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-xl border-border font-bold text-xs sm:text-sm h-11 cursor-pointer"
              disabled={!isAvailable || addCartItem.isPending}
              onClick={handleAddToCart}
            >
              {addCartItem.isPending ? (
                <Spinner className="size-4 text-current" />
              ) : (
                <BagShopping data-icon="inline-start" />
              )}
              {isAvailable
                ? addCartItem.isPending
                  ? "কার্টে যুক্ত হচ্ছে..."
                  : "কার্টে যোগ করুন"
                : "স্টক শেষ"}
            </Button>

            <p className="text-[11px] text-center text-muted-foreground pt-0.5">
              🔒 ১০০% নিরাপদ অনলাইন পেমেন্ট (বিকাশ/নগদ/কার্ড) • ১০০% খাঁটি পণ্য
            </p>

            <Button
              render={
                <Link href={`/product/${product.handle}`}>
                  সম্পূর্ণ বিবরণ ও গ্রাহক রিভিউ দেখুন →
                </Link>
              }
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => setOpen(false)}
            />
          </div>
        </div>
      </ResponsiveDialog>
    </>
  );
}
