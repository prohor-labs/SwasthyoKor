import { Injectable } from "@nestjs/common";
import {
  and,
  desc,
  asc,
  eq,
  ilike,
  inArray,
  or,
  type SQL,
  type InferSelectModel,
} from "drizzle-orm";
import type {
  Collection,
  Menu,
  Page,
  Product,
} from "../types.js";
import { DrizzleService } from "../drizzle/drizzle.service.js";
import {
  blogs,
  collections,
  heroBanners,
  menus,
  pages,
  productCollections,
  type productImages,
  type productOptions,
  productReviews,
  products,
  type productVariants,
  storeSettings,
} from "../drizzle/schema.js";

type SortKey = "RELEVANCE" | "BEST_SELLING" | "CREATED_AT" | "PRICE";

type ProductRow = InferSelectModel<typeof products> & {
  images: InferSelectModel<typeof productImages>[];
  variants: InferSelectModel<typeof productVariants>[];
  options: InferSelectModel<typeof productOptions>[];
  reviews?: InferSelectModel<typeof productReviews>[];
  collections?: {
    collection: InferSelectModel<typeof collections>;
  }[];
};

const DEFAULT_CURRENCY = "BDT";

function money(amount: number, currencyCode = DEFAULT_CURRENCY) {
  return { amount: amount.toFixed(2), currencyCode };
}

function toProduct(row: ProductRow): Product {
  const variants = row.variants.map((variant) => ({
    id: variant.id,
    title: variant.title,
    availableForSale:
      variant.availableForSale && (variant.inventoryQuantity ?? 15) > 0,
    inventoryQuantity: variant.inventoryQuantity ?? 15,
    unit: variant.unit ?? "packet",
    selectedOptions: variant.selectedOptions,
    price: money(variant.priceAmount, variant.priceCurrency),
    compareAtPrice: variant.compareAtPrice
      ? money(variant.compareAtPrice, variant.priceCurrency)
      : undefined,
  }));

  const prices = row.variants.map((variant) => variant.priceAmount);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const comparePrices = row.variants
    .map((variant) => variant.compareAtPrice)
    .filter((p): p is number => typeof p === "number" && p > 0);
  const minComparePrice = comparePrices.length
    ? Math.min(...comparePrices)
    : undefined;
  const maxComparePrice = comparePrices.length
    ? Math.max(...comparePrices)
    : undefined;

  const images = row.images.map((image) => ({
    url: image.url,
    altText: image.altText,
    width: image.width,
    height: image.height,
  }));

  const firstCollection = row.collections?.[0]?.collection;

  const reviewsList = row.reviews || [];
  const reviewCount = reviewsList.length;
  const rating =
    reviewCount > 0
      ? Number(
          (
            reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewCount
          ).toFixed(1),
        )
      : 0;

  const hasInStockVariant = variants.some((v) => v.availableForSale);

  return {
    id: row.id,
    handle: row.handle,
    title: row.title,
    description: row.description,
    descriptionHtml:
      row.descriptionHtml ||
      (row.description
        ? `<p>${row.description.replace(/\r\n/g, "\n").replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`
        : undefined),
    tags: row.tags,
    availableForSale: row.availableForSale && hasInStockVariant,
    rating,
    reviewCount,
    category: firstCollection
      ? {
          id: firstCollection.id,
          handle: firstCollection.handle,
          title: firstCollection.title,
        }
      : undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    priceRange: {
      minVariantPrice: money(minPrice),
      maxVariantPrice: money(maxPrice),
    },
    compareAtPriceRange:
      minComparePrice !== undefined && maxComparePrice !== undefined
        ? {
            minVariantPrice: money(minComparePrice),
            maxVariantPrice: money(maxComparePrice),
          }
        : undefined,
    featuredImage: images[0],
    images,
    variants,
    options: row.options.map((option) => ({
      id: option.id,
      name: option.name,
      values: option.values,
    })),
    seo: { title: row.title, description: row.description },
  };
}

function sortProducts(
  prods: Product[],
  sortKey: SortKey,
  reverse: boolean,
): Product[] {
  const sorted = [...prods].sort((a, b) => {
    switch (sortKey) {
      case "PRICE":
        return (
          Number(a.priceRange.minVariantPrice.amount) -
          Number(b.priceRange.minVariantPrice.amount)
        );
      case "CREATED_AT":
        return a.createdAt.localeCompare(b.createdAt);
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });

  return reverse ? sorted.reverse() : sorted;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  readTime: string;
  author: string;
  coverImage: string;
  tags: string[];
  faqs: { question: string; answer: string }[];
  relatedProductHandles: string[];
  publishedAt: string;
  updatedAt: string;
  relatedProducts?: {
    title: string;
    handle: string;
    price: string;
    image: string;
  }[];
}

@Injectable()
export class ProductsService {
  constructor(private readonly drizzle: DrizzleService) {}

  private async loadProducts(where?: SQL): Promise<Product[]> {
    const rows = await this.drizzle.db.query.products.findMany({
      where,
      with: {
        images: { orderBy: (image, { asc: a }) => [a(image.position)] },
        variants: { orderBy: (variant, { asc: a }) => [a(variant.position)] },
        options: { orderBy: (option, { asc: a }) => [a(option.position)] },
        reviews: true,
        collections: {
          with: {
            collection: true,
          },
        },
      },
    });

    return rows.map(toProduct);
  }

  async getProducts({
    query,
    sortKey,
    reverse,
  }: {
    query?: string;
    sortKey?: SortKey;
    reverse?: boolean;
  }): Promise<Product[]> {
    const where = query
      ? or(
          ilike(products.title, `%${query}%`),
          ilike(products.description, `%${query}%`),
          ilike(products.handle, `%${query}%`),
        )
      : undefined;

    const all = await this.loadProducts(where);
    return sortProducts(all, sortKey ?? "RELEVANCE", reverse ?? false);
  }

  async getProduct(handle: string): Promise<Product | undefined> {
    const row = await this.drizzle.db.query.products.findFirst({
      where: eq(products.handle, handle),
      with: {
        images: { orderBy: (image, { asc: a }) => [a(image.position)] },
        variants: { orderBy: (variant, { asc: a }) => [a(variant.position)] },
        options: { orderBy: (option, { asc: a }) => [a(option.position)] },
        reviews: true,
        collections: {
          with: {
            collection: true,
          },
        },
      },
    });

    return row ? toProduct(row) : undefined;
  }

  async getProductRecommendations(productId: string): Promise<Product[]> {
    const productCollectionsForId = await this.drizzle.db
      .select({ collectionId: productCollections.collectionId })
      .from(productCollections)
      .where(eq(productCollections.productId, productId));

    const collectionIds = productCollectionsForId.map((pc) => pc.collectionId);

    let relatedIds: string[] = [];
    if (collectionIds.length) {
      const relatedRows = await this.drizzle.db
        .select({ productId: productCollections.productId })
        .from(productCollections)
        .where(inArray(productCollections.collectionId, collectionIds));

      relatedIds = [
        ...new Set(
          relatedRows
            .map((row) => row.productId)
            .filter((id) => id !== productId),
        ),
      ];
    }

    let recommendations: Product[] = [];
    if (relatedIds.length > 0) {
      recommendations = await this.loadProducts(
        inArray(products.id, relatedIds.slice(0, 4)),
      );
    }

    if (recommendations.length < 4) {
      const fallback = await this.loadProducts();
      for (const item of fallback) {
        if (
          item.id !== productId &&
          !recommendations.some((r) => r.id === item.id)
        ) {
          recommendations.push(item);
        }
        if (recommendations.length >= 4) break;
      }
    }

    return recommendations;
  }

  async getCollections(): Promise<Collection[]> {
    const rows = await this.drizzle.db.query.collections.findMany({
      where: eq(collections.hidden, false),
      orderBy: (collection, { asc: a }) => [a(collection.displayOrder)],
    });

    return rows.map((c) => ({
      handle: c.handle,
      title: c.title,
      description: c.description ?? "",
      seo: {
        title: c.seoTitle ?? c.title,
        description: c.seoDescription ?? c.description ?? "",
      },
      updatedAt: c.updatedAt.toISOString(),
      path: `/search/${c.handle}`,
    }));
  }

  async getCollection(handle: string): Promise<Collection | undefined> {
    const c = await this.drizzle.db.query.collections.findFirst({
      where: and(eq(collections.handle, handle), eq(collections.hidden, false)),
    });

    if (!c) return undefined;

    return {
      handle: c.handle,
      title: c.title,
      description: c.description ?? "",
      seo: {
        title: c.seoTitle ?? c.title,
        description: c.seoDescription ?? c.description ?? "",
      },
      updatedAt: c.updatedAt.toISOString(),
      path: `/search/${c.handle}`,
    };
  }

  async getCategorySliderCategories() {
    const rows = await this.drizzle.db.query.collections.findMany({
      where: and(
        eq(collections.hidden, false),
        eq(collections.showOnHomepage, true),
      ),
      orderBy: (collection, { asc: a }) => [a(collection.displayOrder)],
    });

    return rows.map((c) => ({
      id: c.id,
      title: c.title,
      handle: c.handle,
      description: c.description ?? "",
      subtitle: c.subtitle ?? undefined,
      image: c.image ?? undefined,
      href: `/categories/${c.handle}`,
    }));
  }

  async getCollectionProducts({
    collection,
    reverse,
    sortKey,
  }: {
    collection: string;
    reverse?: boolean;
    sortKey?: SortKey;
  }): Promise<Product[]> {
    const foundCollection = await this.drizzle.db.query.collections.findFirst({
      where: eq(collections.handle, collection),
    });

    if (!foundCollection) return [];

    const joins = await this.drizzle.db.query.productCollections.findMany({
      where: eq(productCollections.collectionId, foundCollection.id),
    });

    const productIds = joins.map((j) => j.productId);
    if (!productIds.length) return [];

    const matched = await this.loadProducts(inArray(products.id, productIds));
    return sortProducts(matched, sortKey ?? "RELEVANCE", reverse ?? false);
  }

  async getHomepageShowcaseCategories() {
    const showcaseCollections =
      await this.drizzle.db.query.collections.findMany({
        where: and(
          eq(collections.showOnHomepage, true),
          eq(collections.hidden, false),
        ),
        orderBy: (c, { asc: a }) => [a(c.displayOrder)],
      });

    return Promise.all(
      showcaseCollections.map(async (collection) => {
        const joins = await this.drizzle.db.query.productCollections.findMany({
          where: eq(productCollections.collectionId, collection.id),
        });
        const productIds = joins.map((j) => j.productId);
        const prods = productIds.length
          ? (await this.loadProducts(inArray(products.id, productIds))).slice(
              0,
              collection.maxProducts ?? 4,
            )
          : [];

        return {
          id: collection.id,
          title: collection.title,
          handle: collection.handle,
          subtitle: collection.subtitle ?? undefined,
          products: prods,
        };
      }),
    );
  }

  async getMenu(handle: string): Promise<Menu[]> {
    const rows = await this.drizzle.db.query.menus.findMany({
      where: eq(menus.handle, handle),
      orderBy: (menu, { asc: a }) => [a(menu.position)],
    });

    return rows.map((m) => ({ title: m.title, path: m.path }));
  }

  async getPage(handle: string): Promise<Page | undefined> {
    const row = await this.drizzle.db.query.pages.findFirst({
      where: eq(pages.handle, handle),
    });

    if (!row) return undefined;

    return {
      id: row.id,
      title: row.title,
      handle: row.handle,
      body: row.body,
      bodySummary: row.bodySummary,
      seo: {
        title: row.seoTitle ?? row.title,
        description: row.seoDescription ?? row.bodySummary,
      },
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async getPages(): Promise<Page[]> {
    const rows = await this.drizzle.db.query.pages.findMany();
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      handle: row.handle,
      body: row.body,
      bodySummary: row.bodySummary,
      seo: {
        title: row.seoTitle ?? row.title,
        description: row.seoDescription ?? row.bodySummary,
      },
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  }

  async getBlogs(): Promise<BlogPost[]> {
    const rows = await this.drizzle.db.query.blogs.findMany({
      where: eq(blogs.published, true),
      orderBy: (blog, { desc: d }) => [d(blog.createdAt)],
    });

    return rows.map((b) => ({
      id: b.id,
      slug: b.slug,
      title: b.title,
      description: b.description,
      content: b.content,
      category: b.category,
      readTime: b.readTime,
      author: b.author,
      coverImage: b.coverImage,
      tags: b.tags,
      faqs: b.faqs,
      relatedProductHandles: b.relatedProductHandles,
      publishedAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    }));
  }

  async getBlog(slug: string): Promise<BlogPost | undefined> {
    const b = await this.drizzle.db.query.blogs.findFirst({
      where: eq(blogs.slug, slug),
    });

    if (!b) return undefined;

    let relatedProducts: {
      title: string;
      handle: string;
      price: string;
      image: string;
    }[] = [];
    if (b.relatedProductHandles && b.relatedProductHandles.length > 0) {
      const prods = await this.loadProducts(
        inArray(products.handle, b.relatedProductHandles),
      );
      relatedProducts = prods.map((p) => ({
        title: p.title,
        handle: p.handle,
        price: `৳${p.priceRange.minVariantPrice.amount}`,
        image: p.featuredImage?.url || "/icon.png",
      }));
    }

    return {
      id: b.id,
      slug: b.slug,
      title: b.title,
      description: b.description,
      content: b.content,
      category: b.category,
      readTime: b.readTime,
      author: b.author,
      coverImage: b.coverImage,
      tags: b.tags,
      faqs: b.faqs,
      relatedProductHandles: b.relatedProductHandles,
      relatedProducts,
      publishedAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    };
  }

  async getStoreSettings() {
    const settings = await this.drizzle.db.query.storeSettings.findFirst({
      where: eq(storeSettings.id, "default"),
    });

    return (
      settings ?? {
        id: "default",
        storeName: "স্বাস্থ্যকর",
        storePhone: "01812345678",
        whatsappNumber: "8801812345678",
        storeEmail: "support@swasthyokor.com",
        storeAddress: "ঢাকা, বাংলাদেশ",
        insideDhakaFee: 60,
        outsideDhakaFee: 120,
        freeShippingMinAmount: 1500,
      }
    );
  }

  async getProductReviews(productId: string) {
    return this.drizzle.db.query.productReviews.findMany({
      where: eq(productReviews.productId, productId),
      orderBy: (review, { desc: d }) => [d(review.createdAt)],
    });
  }

  async getHeroBanners() {
    const rows = await this.drizzle.db.query.heroBanners.findMany({
      where: eq(heroBanners.active, true),
      orderBy: (banner, { asc: a }) => [a(banner.position)],
    });

    if (rows.length) return rows;

    return [
      {
        id: "1",
        title: "১০০% খাঁটি সুন্দরবন মধু ও",
        highlight: "গাওয়া ঘি",
        subtitle:
          "প্রকৃতির নিখাদ দান, কোনো কৃত্রিম মিষ্টি বা প্রিজারভেটিভ ছাড়া সরাসরি সুন্দরবন ও খামার থেকে সংগৃহীত।",
        link: "/search?q=মধু",
        accentColor: "text-amber-400",
        image:
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1600&auto=format&fit=crop&q=85",
        position: 0,
        active: true,
        createdAt: new Date(),
      },
    ];
  }
}
