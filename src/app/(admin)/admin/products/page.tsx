import { CreateProductDialog, ProductsList } from "@/components/admin";
import { db } from "@/lib/db";
import {
  collections,
  productCollections,
  productImages,
  products,
  productVariants,
} from "@/lib/db/schema";

export const metadata = {
  title: "পণ্য পরিচালনা| অ্যাডমিন",
  description: "স্বাস্থ্যকর পণ্যের তালিকা, স্টক ও মূল্য পরিচালনা।",
};

export default async function AdminProductsPage() {
  const [
    allProducts,
    allImages,
    allVariants,
    allCollections,
    allProdCollections,
  ] = await Promise.all([
    db.select().from(products),
    db.select().from(productImages),
    db.select().from(productVariants),
    db.select().from(collections),
    db.select().from(productCollections),
  ]);

  const formattedProducts = allProducts.map((prod) => {
    const img = allImages.find((i) => i.productId === prod.id);
    const prodVariants = allVariants
      .filter((v) => v.productId === prod.id)
      .sort((a, b) => a.position - b.position);
    const variant = prodVariants[0];
    const prodCol = allProdCollections.find((pc) => pc.productId === prod.id);

    const totalInventory = prodVariants.reduce(
      (acc, v) => acc + (v.inventoryQuantity ?? 15),
      0,
    );
    const unit = variant?.unit || "packet";
    const displayPrice = variant ? String(variant.priceAmount) : "0";
    const displayComparePrice = variant?.compareAtPrice
      ? String(variant.compareAtPrice)
      : undefined;

    return {
      id: prod.id,
      title: prod.title,
      handle: prod.handle,
      description: prod.description,
      collectionId: prodCol?.collectionId,
      price: displayPrice,
      compareAtPrice: displayComparePrice,
      inventoryQuantity: totalInventory,
      unit,
      imageUrl: img?.url,
      available: prod.availableForSale && totalInventory > 0,
      variants: prodVariants.map((v) => ({
        id: v.id,
        title: v.title,
        price: String(v.priceAmount),
        compareAtPrice: v.compareAtPrice ? String(v.compareAtPrice) : undefined,
        inventoryQuantity: v.inventoryQuantity ?? 15,
        unit: (v.unit as any) || "packet",
      })),
    };
  });


  const collectionsList = allCollections.map((c) => ({
    id: c.id,
    title: c.title,
  }));

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            পণ্য পরিচালনা
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            মোট {formattedProducts.length}টি পণ্য স্টোরে রয়েছে।
          </p>
        </div>
        <CreateProductDialog collections={collectionsList} />
      </div>

      <ProductsList
        products={formattedProducts}
        collections={collectionsList}
      />
    </div>
  );
}
