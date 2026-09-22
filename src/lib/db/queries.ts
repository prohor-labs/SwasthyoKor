import {
  and,
  eq,
  type InferSelectModel,
  ilike,
  inArray,
  or,
  type SQL,
} from "drizzle-orm";
import type {
  Cart,
  CartItem,
  Collection,
  Menu,
  Order,
  Page,
  Product,
} from "../types";
import { db } from "./index";
import {
  blogs,
  cartItems,
  carts,
  collections,
  heroBanners,
  menus,
  orders,
  pages,
  productCollections,
  type productImages,
  type productOptions,
  productReviews,
  products,
  type productVariants,
  storeSettings,
} from "./schema";

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
    availableForSale: variant.availableForSale && (variant.inventoryQuantity ?? 15) > 0,
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
  const minComparePrice = comparePrices.length ? Math.min(...comparePrices) : undefined;
  const maxComparePrice = comparePrices.length ? Math.max(...comparePrices) : undefined;

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


async function loadProducts(where?: SQL): Promise<Product[]> {
  const rows = await db.query.products.findMany({
    where,
    with: {
      images: { orderBy: (image, { asc }) => [asc(image.position)] },
      variants: { orderBy: (variant, { asc }) => [asc(variant.position)] },
      options: { orderBy: (option, { asc }) => [asc(option.position)] },
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

function sortProducts(
  products: Product[],
  sortKey: SortKey,
  reverse: boolean,
): Product[] {
  const sorted = [...products].sort((a, b) => {
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

export async function getProducts({
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

  const all = await loadProducts(where);
  return sortProducts(all, sortKey ?? "RELEVANCE", reverse ?? false);
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  const row = await db.query.products.findFirst({
    where: eq(products.handle, handle),
    with: {
      images: { orderBy: (image, { asc }) => [asc(image.position)] },
      variants: { orderBy: (variant, { asc }) => [asc(variant.position)] },
      options: { orderBy: (option, { asc }) => [asc(option.position)] },
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

export async function getProductRecommendations(
  productId: string,
): Promise<Product[]> {
  const productCollectionsForId = await db
    .select({ collectionId: productCollections.collectionId })
    .from(productCollections)
    .where(eq(productCollections.productId, productId));

  const collectionIds = productCollectionsForId.map((pc) => pc.collectionId);

  let relatedIds: string[] = [];
  if (collectionIds.length) {
    const relatedRows = await db
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
    recommendations = await loadProducts(
      inArray(products.id, relatedIds.slice(0, 4)),
    );
  }

  if (recommendations.length < 4) {
    const existingIds = [productId, ...recommendations.map((r) => r.id)];
    const additionalRows = await db.query.products.findMany({
      where: (p, { notInArray }) => notInArray(p.id, existingIds),
      limit: 4 - recommendations.length,
    });
    if (additionalRows.length > 0) {
      const additional = await loadProducts(
        inArray(
          products.id,
          additionalRows.map((p) => p.id),
        ),
      );
      recommendations.push(...additional);
    }
  }

  return recommendations.slice(0, 4);
}

export async function getCollections(): Promise<Collection[]> {
  const rows = await db.query.collections.findMany({
    where: eq(collections.hidden, false),
    orderBy: (collection, { asc }) => [asc(collection.title)],
  });

  return [
    {
      id: "all",
      handle: "",
      title: "সকল পণ্য (All)",
      description: "সকল পণ্য",
      image: null,
      seo: { title: "সকল পণ্য", description: "সকল পণ্য" },
      path: "/search",
      updatedAt: new Date(0).toISOString(),
    },
    ...rows.map((collection) => ({
      id: collection.id,
      handle: collection.handle,
      title: collection.title,
      description: collection.description ?? "",
      image: collection.image ?? null,
      seo: {
        title: collection.seoTitle ?? collection.title,
        description: collection.seoDescription ?? collection.description ?? "",
      },
      path: `/search/${collection.handle}`,
      updatedAt: collection.updatedAt.toISOString(),
    })),
  ];
}

export async function getCollection(
  handle: string,
): Promise<Collection | undefined> {
  const row = await db.query.collections.findFirst({
    where: eq(collections.handle, handle),
  });

  if (!row) return undefined;

  return {
    id: row.id,
    handle: row.handle,
    title: row.title,
    description: row.description ?? "",
    image: row.image ?? null,
    seo: {
      title: row.seoTitle ?? row.title,
      description: row.seoDescription ?? row.description ?? "",
    },
    path: `/search/${row.handle}`,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export interface CategorySliderItem {
  id?: string;
  name: string;
  nameEn?: string;
  image: string;
  href: string;
}

export async function getCategorySliderCategories(): Promise<
  CategorySliderItem[]
> {
  const rows = await db.query.collections.findMany({
    where: eq(collections.hidden, false),
    orderBy: (collection, { asc }) => [asc(collection.title)],
  });

  const items: CategorySliderItem[] = rows.map((collection) => {
    // Extract Bangla name and English label if title format is "বাংলা (English)"
    const match = collection.title.match(/^(.*?)(?:\s*\((.*?)\))?$/);
    const name = match ? match[1].trim() : collection.title;
    const nameEn = match?.[2] ? match[2].trim() : undefined;

    return {
      id: collection.id,
      name,
      nameEn,
      image:
        collection.image ||
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80",
      href: `/category/${collection.handle}`,
    };
  });

  return items;
}

export async function getCollectionProducts({
  collection,
  sortKey,
  reverse,
}: {
  collection: string;
  sortKey?: SortKey;
  reverse?: boolean;
}): Promise<Product[]> {
  const row = await db.query.collections.findFirst({
    where: eq(collections.handle, collection),
    with: { products: true },
  });

  if (!row) return [];

  const productIds = row.products.map((pc) => pc.productId);
  if (!productIds.length) return [];

  const all = await loadProducts(inArray(products.id, productIds));
  return sortProducts(all, sortKey ?? "RELEVANCE", reverse ?? false);
}

export interface HomepageShowcaseCategory {
  id: string;
  handle: string;
  title: string;
  subtitle: string | null;
  displayOrder: number;
  products: Product[];
}

export async function getHomepageShowcaseCategories(): Promise<
  HomepageShowcaseCategory[]
> {
  let rows = await db.query.collections.findMany({
    where: and(
      eq(collections.showOnHomepage, true),
      eq(collections.hidden, false),
    ),
    orderBy: (col, { asc, desc }) => [
      asc(col.displayOrder),
      desc(col.createdAt),
    ],
  });

  // Fallback: If no collections are explicitly marked for homepage showcase yet, fallback to non-hidden collections
  if (rows.length === 0) {
    rows = await db.query.collections.findMany({
      where: eq(collections.hidden, false),
      orderBy: (col, { asc, desc }) => [
        asc(col.displayOrder),
        desc(col.createdAt),
      ],
      limit: 6,
    });
  }

  const results = await Promise.all(
    rows.map(async (col) => {
      const limit = col.maxProducts && col.maxProducts > 4 ? col.maxProducts : 10;
      const products = await getCollectionProducts({ collection: col.handle });
      return {
        id: col.id,
        handle: col.handle,
        title: col.title,
        subtitle: col.subtitle || col.description || null,
        displayOrder: col.displayOrder,
        products: products.slice(0, limit),
      };
    }),
  );

  return results.filter((cat) => cat.products.length > 0);
}

export async function getMenu(handle: string): Promise<Menu[]> {
  const rows = await db.query.menus.findMany({
    where: eq(menus.handle, handle),
    orderBy: (menu, { asc }) => [asc(menu.position)],
  });

  return rows.map((menu) => ({ title: menu.title, path: menu.path }));
}

export async function getPage(handle: string): Promise<Page | undefined> {
  const row = await db.query.pages.findFirst({
    where: eq(pages.handle, handle),
  });

  if (!row) return undefined;

  return {
    id: row.id,
    title: row.title,
    handle: row.handle,
    body: row.body,
    bodySummary: row.bodySummary,
    seo:
      row.seoTitle || row.seoDescription
        ? {
            title: row.seoTitle ?? row.title,
            description: row.seoDescription ?? row.bodySummary,
          }
        : undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getPages(): Promise<Page[]> {
  const rows = await db.query.pages.findMany({
    orderBy: (page, { asc }) => [asc(page.title)],
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    handle: row.handle,
    body: row.body,
    bodySummary: row.bodySummary,
    seo:
      row.seoTitle || row.seoDescription
        ? {
            title: row.seoTitle ?? row.title,
            description: row.seoDescription ?? row.bodySummary,
          }
        : undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
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

export async function getBlogs(): Promise<BlogPost[]> {
  const rows = await db.query.blogs.findMany({
    where: eq(blogs.published, true),
    orderBy: (blog, { desc }) => [desc(blog.createdAt)],
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

export async function getBlog(slug: string): Promise<BlogPost | undefined> {
  const b = await db.query.blogs.findFirst({
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
    const prods = await loadProducts(
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

export async function getCart(cartId?: string | null): Promise<Cart | null> {
  if (!cartId) return null;

  const cart = await db.query.carts.findFirst({
    where: eq(carts.id, cartId),
  });
  if (!cart) return null;

  const items = await db.query.cartItems.findMany({
    where: eq(cartItems.cartId, cartId),
    with: {
      variant: true,
      product: { with: { images: true } },
    },
  });

  const lines: CartItem[] = items.map((item) => {
    const lineTotal = item.variant.priceAmount * item.quantity;
    const featuredImage = item.product.images.find(
      (image) => image.position === 1,
    );
    const image = featuredImage ?? item.product.images[0];

    return {
      id: item.id,
      quantity: item.quantity,
      cost: {
        totalAmount: money(lineTotal, item.variant.priceCurrency),
      },
      merchandise: {
        id: item.variantId,
        title: item.variant.title,
        selectedOptions: item.variant.selectedOptions,
        product: {
          id: item.product.id,
          handle: item.product.handle,
          title: item.product.title,
          featuredImage: image
            ? {
                url: image.url,
                altText: image.altText,
                width: image.width,
                height: image.height,
              }
            : undefined,
        },
      },
    };
  });

  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce(
    (sum, line) => sum + Number(line.cost.totalAmount.amount),
    0,
  );
  const currencyCode = lines[0]?.cost.totalAmount.currencyCode ?? "BDT";

  return {
    id: cart.id,
    totalQuantity,
    lines,
    cost: {
      subtotalAmount: money(subtotal, currencyCode),
      totalAmount: money(subtotal, currencyCode),
      totalTaxAmount: money(0, currencyCode),
    },
  };
}

export async function getOrder(id: string): Promise<Order | null> {
  const row = await db.query.orders.findFirst({
    where: eq(orders.id, id),
  });

  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    customerName: row.customerName,
    shippingAddress: row.shippingAddress,
    paymentMethod: row.paymentMethod,
    paymentStatus: row.paymentStatus,
    paymentInvoiceId: row.paymentInvoiceId,
    paymentTrxId: row.paymentTrxId,
    paymentSenderNumber: row.paymentSenderNumber,
    couponCode: row.couponCode,
    discountAmount: row.discountAmount,
    totalAmount: row.totalAmount,
    totalCurrency: row.totalCurrency,

    status: row.status,
    items: row.items,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getStoreSettings() {
  const settings = await db.query.storeSettings.findFirst({
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

export async function getProductReviews(productId: string) {
  return db.query.productReviews.findMany({
    where: eq(productReviews.productId, productId),
    orderBy: (review, { desc }) => [desc(review.createdAt)],
  });
}

export async function getHeroBanners() {
  const rows = await db.query.heroBanners.findMany({
    where: eq(heroBanners.active, true),
    orderBy: (banner, { asc }) => [asc(banner.position)],
  });

  if (rows.length) return rows;

  // Default seed fallback if table is empty
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
    {
      id: "2",
      title: "ঘানি ভাঙা সরিষার তেল ও",
      highlight: "কালোজিরা তেল",
      subtitle:
        "কাঠের ঘানিতে ভাঙা প্রাকৃতিক ঝাঁঝ ও খাঁটি পুষ্টিতে ভরপুর স্বাস্থ্যকর রান্নার শ্রেষ্ঠ উপাদান।",
      link: "/search?q=তেল",
      accentColor: "text-emerald-400",
      image:
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=1600&auto=format&fit=crop&q=85",
      position: 1,
      active: true,
      createdAt: new Date(),
    },
    {
      id: "3",
      title: "প্রিমিয়াম অর্গানিক চিয়া সিড ও",
      highlight: "সুপারফুড সংগ্রহ",
      subtitle: "প্রতিদিনের সুস্থতা ও রোগ প্রতিরোধ ক্ষমতা বৃদ্ধিতে খাঁটি সুপারফুডের সমাহার।",
      link: "/search/superfoods-wellness",
      accentColor: "text-teal-400",
      image:
        "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=1600&auto=format&fit=crop&q=85",
      position: 2,
      active: true,
      createdAt: new Date(),
    },
    {
      id: "4",
      title: "সেরা বাছাইকৃত ড্রাই ফ্রুটস ও",
      highlight: "পুষ্টিকর বাদাম",
      subtitle: "আমন্ড, কাজু, পেস্তা, আখরোট ও প্রিমিয়াম কিশমিশের সেরা স্বাস্থ্যকর স্ন্যাক্স।",
      link: "/search?q=বাদাম",
      accentColor: "text-amber-300",
      image:
        "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&auto=format&fit=crop&q=85",
      position: 3,
      active: true,
      createdAt: new Date(),
    },
  ];
}
