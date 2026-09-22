import Link from "next/link";
import { notFound } from "next/navigation";
import { Category } from "@/components/icons";
import { ProductCard } from "@/components/product";
import { Button } from "@/components/ui/button";
import {
  getCollection,
  getCollectionProducts,
  getCollections,
} from "@/lib/db/queries";

export async function generateMetadata(props: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await props.params;
  const collection = await getCollection(handle);

  if (!collection) return notFound();

  return {
    title: `${collection.title} | স্বাস্থ্যকর`,
    description:
      collection.description || `${collection.title} এর সেরা অর্গানিক পণ্যসমূহ।`,
  };
}

export default async function CategoryDetailPage(props: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await props.params;
  const collection = await getCollection(handle);

  if (!collection) return notFound();

  const products = await getCollectionProducts({ collection: handle });
  const allCollections = await getCollections();
  const otherCategories = allCollections.filter(
    (c) => !c.handle.startsWith("hidden-") && c.handle !== handle,
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-10 flex flex-col gap-8">
      {/* Category Header Banner */}
      <div className="flex flex-col gap-3 border-b border-border/60 pb-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            হোম
          </Link>
          <span>/</span>
          <Link href="/category" className="hover:text-foreground">
            ক্যাটাগরি
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">
            {collection.title}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
              {collection.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              {collection.description ||
                "সেরা মানের ও খাঁটি উপাদানে প্রস্তুত স্বাস্থ্যকর পণ্য সম্ভার।"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              মোট {products.length}টি পণ্য
            </span>
          </div>
        </div>

        {/* Quick Category Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 [scrollbar-width:none]">
          <Link
            href="/category"
            className="flex-none rounded-full px-3 py-1 text-xs font-semibold bg-muted text-muted-foreground hover:bg-muted/80"
          >
            সব ক্যাটাগরি
          </Link>
          {otherCategories.map((cat) => (
            <Link
              key={cat.handle}
              href={`/category/${cat.handle}`}
              className="flex-none rounded-full px-3 py-1 text-xs font-semibold bg-muted/60 text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 transition-colors"
            >
              {cat.title}
            </Link>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card">
          <Category className="size-10 text-muted-foreground mb-3" />
          <h3 className="text-base font-bold text-foreground">
            এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            শীঘ্রই নতুন স্টক যুক্ত করা হবে।
          </p>
          <Button
            render={<Link href="/category" />}
            size="sm"
            className="mt-4 rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-500"
          >
            অন্যান্য ক্যাটাগরি দেখুন
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {products.map((product) => (
            <ProductCard key={product.handle} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
