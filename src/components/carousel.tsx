import Image from "next/image";
import Link from "next/link";
import Price from "@/components/price";
import { ProductQuickView } from "@/components/product";
import { getCollectionProducts } from "@/lib/db/queries";

export async function Carousel() {
  const products = await getCollectionProducts({
    collection: "hidden-homepage-carousel",
  });

  if (!products?.length) return null;

  const carouselProducts = [...products, ...products];

  return (
    <div className="relative w-full overflow-hidden pb-4 sm:pb-6 pt-1">
      {/* Smooth Edge Fades on Left and Right to eliminate cut feel */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-6 sm:w-14 md:w-20 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-6 sm:w-14 md:w-20 bg-gradient-to-l from-background to-transparent" />

      <div className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex animate-carousel gap-3 sm:gap-4 px-3 sm:px-4 hover:[animation-play-state:paused]">
          {carouselProducts.map((product, i) => (
            <li
              key={`${product.handle}-${i}`}
              className="group relative h-[210px] sm:h-[260px] w-[68vw] max-w-[280px] sm:max-w-[340px] flex-none overflow-hidden rounded-2xl border-0 sm:border border-border/60 bg-muted/20 sm:bg-card transition-all duration-300 hover:border-emerald-500/50 hover:shadow-md sm:w-1/2 md:w-1/3 lg:w-1/4"
            >
              <ProductQuickView product={product} className="size-full">
                <Link
                  href={`/product/${product.handle}`}
                  className="relative flex size-full items-center justify-center p-3 sm:p-4"
                  prefetch={true}
                >
                  {product.featuredImage?.url ? (
                    <Image
                      src={product.featuredImage.url}
                      alt={product.title}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 70vw"
                      className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  ) : null}

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 z-10 flex items-center justify-between rounded-xl border border-border/60 bg-background/85 p-2 backdrop-blur-md transition-colors group-hover:border-emerald-500/40">
                    <h3 className="line-clamp-1 text-[11px] sm:text-xs font-medium text-foreground">
                      {product.title}
                    </h3>
                    <Price
                      className="shrink-0 rounded-md bg-emerald-600 px-1.5 py-0.5 sm:px-2 text-[11px] sm:text-xs font-semibold text-white shadow-xs"
                      amount={product.priceRange.minVariantPrice.amount}
                      currencyCode={
                        product.priceRange.minVariantPrice.currencyCode
                      }
                    />
                  </div>
                </Link>
              </ProductQuickView>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
