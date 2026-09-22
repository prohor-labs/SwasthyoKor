import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product";
import { defaultSort, sorting } from "@/lib/constants";
import { getCollection, getCollectionProducts } from "@/lib/db/queries";

export async function generateMetadata(props: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const { collection: collectionHandle } = await props.params;
  const collection = await getCollection(collectionHandle);

  if (!collection) return notFound();

  return {
    title: `${collection.seo?.title || collection.title} | স্বাস্থ্যকর`,
    description:
      collection.seo?.description ||
      collection.description ||
      `${collection.title} পণ্যসমূহ`,
  };
}

export default async function CollectionPage(props: {
  params: Promise<{ collection: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { collection: collectionHandle } = await props.params;
  const searchParams = await props.searchParams;
  const { sort } = searchParams as { [key: string]: string };
  const currentSort = sorting.find((item) => item.slug === sort) || defaultSort;
  const { sortKey, reverse } = currentSort;

  const collection = await getCollection(collectionHandle);
  if (!collection) return notFound();

  const products = await getCollectionProducts({
    collection: collectionHandle,
    sortKey,
    reverse,
  });

  return (
    <section>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {collection.title}
        </h1>
        {collection.description ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {collection.description}
          </p>
        ) : null}
      </div>

      {products.length === 0 ? (
        <p className="py-8 text-neutral-500">এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
          {products.map((product, idx) => (
            <ProductCard
              key={product.handle}
              product={product}
              priority={idx < 4}
            />
          ))}
        </div>
      )}
    </section>
  );
}
