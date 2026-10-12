import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { ProductCard } from "@/components/product";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/db/queries";

export async function FlashDealsSection() {
  const allProducts = await getProducts({});
  const dealProducts = allProducts.slice(0, 4);

  if (!dealProducts.length) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-4 sm:py-8">
      {/* Clean Minimal Header */}
      <div className="mb-4 sm:mb-6 flex items-end justify-between border-b border-border/50 pb-3 sm:pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            হট ডিল ও বিশেষ অফার
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            খাঁটি অর্গানিক পণ্যে আকর্ষণীয় ছাড় ও স্পেশাল সেভার বান্ডেল
          </p>
        </div>

        <Button
          render={<Link href="/search" />}
          variant="outline"
          size="sm"
          className="rounded-full text-xs font-semibold shrink-0 border-border/80"
        >
          <span>সব অফার দেখুন</span>
          <ArrowRight className="size-3.5 ml-1" />
        </Button>
      </div>

      {/* Clean Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {dealProducts.map((product) => (
          <ProductCard key={product.handle} product={product} />
        ))}
      </div>
    </section>
  );
}
