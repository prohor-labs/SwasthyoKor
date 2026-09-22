import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import { ProductQuickView } from "./ProductQuickView";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const currentPrice = Number(product.priceRange.minVariantPrice.amount);
  const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount
    ? Number(product.compareAtPriceRange.minVariantPrice.amount)
    : undefined;
  const savings =
    compareAtPrice && compareAtPrice > currentPrice
      ? compareAtPrice - currentPrice
      : 0;

  const ratingVal =
    product.rating && product.rating > 0 ? product.rating.toFixed(1) : "৫.০";
  const reviewCount =
    product.reviewCount && product.reviewCount > 0
      ? `(${product.reviewCount.toLocaleString("bn-BD")})`
      : "(নতুন)";

  return (
    <ProductQuickView product={product} className="size-full">
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border-0 sm:border sm:border-border/70 bg-transparent sm:bg-card p-1 sm:p-3.5 shadow-none sm:shadow-2xs transition-all duration-300 hover:border-emerald-500/50 hover:shadow-md h-full">
        {/* Product Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/25 sm:bg-muted/30 mb-2">
          <Link href={`/product/${product.handle}`} className="block size-full">
            {product.featuredImage?.url ? (
              <Image
                src={product.featuredImage.url}
                alt={product.title}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority={priority}
              />
            ) : null}
          </Link>

          {/* Dynamic Discount Badge if compareAtPrice is configured in DB */}
          {savings > 0 && (
            <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 rounded-lg bg-rose-600 px-1.5 py-0.5 text-[9px] sm:text-[11px] font-black text-white shadow-xs">
              ৳{savings.toLocaleString("bn-BD")} ছাড়
            </div>
          )}
        </div>

        {/* Title & Rating */}
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px]">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            <span className="font-bold text-foreground">{ratingVal}</span>
            <span className="text-muted-foreground">{reviewCount}</span>
          </div>

          <Link
            href={`/product/${product.handle}`}
            className="line-clamp-2 text-xs sm:text-sm font-bold text-foreground hover:text-emerald-600 transition-colors leading-snug"
          >
            {product.title}
          </Link>

          {/* Price Row */}
          <div className="mt-auto pt-1.5 flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-xs sm:text-base font-black text-emerald-600 dark:text-emerald-400">
              ৳{currentPrice.toLocaleString("bn-BD")}
            </span>
            {compareAtPrice && compareAtPrice > currentPrice && (
              <span className="text-[10px] sm:text-xs text-muted-foreground line-through decoration-rose-500/60 font-semibold">
                ৳{compareAtPrice.toLocaleString("bn-BD")}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 sm:pt-3 mt-1.5 sm:mt-2 border-t-0 sm:border-t sm:border-border/50">
          <Button
            render={<Link href={`/product/${product.handle}`} />}
            size="sm"
            className="w-full rounded-lg sm:rounded-xl bg-emerald-600 font-bold text-white text-xs sm:text-sm hover:bg-emerald-700 shadow-xs h-9 sm:h-10 cursor-pointer"
          >
            <ShoppingBag className="size-3.5 sm:size-4 shrink-0" />
            <span>অর্ডার করুন</span>
          </Button>
        </div>
      </div>
    </ProductQuickView>
  );
}
