import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const productUnitEnum = pgEnum("product_unit_type", [
  "packet",
  "jar",
  "bottle",
  "piece",
  "box",
  "kg",
  "gram",
  "litre",
  "ml",
]);

export const collections = pgTable(
  "collections",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    handle: varchar("handle", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    subtitle: text("subtitle"),
    image: text("image"),
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: text("seo_description"),
    showOnHomepage: boolean("show_on_homepage").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    maxProducts: integer("max_products").notNull().default(4),
    hidden: boolean("hidden").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("collections_handle_idx").on(table.handle),
    index("collections_homepage_idx").on(table.showOnHomepage),
  ],
);

export const products = pgTable(
  "products",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    handle: varchar("handle", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    descriptionHtml: text("description_html"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    availableForSale: boolean("available_for_sale").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("products_handle_idx").on(table.handle),
    index("products_available_idx").on(table.availableForSale),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    productId: varchar("product_id", { length: 255 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    altText: text("alt_text").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    position: integer("position").notNull().default(0),
  },
  (table) => [index("product_images_product_idx").on(table.productId)],
);

export const productOptions = pgTable(
  "product_options",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    productId: varchar("product_id", { length: 255 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    position: integer("position").notNull().default(0),
    values: jsonb("values").$type<string[]>().notNull().default([]),
  },
  (table) => [index("product_options_product_idx").on(table.productId)],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    productId: varchar("product_id", { length: 255 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    priceAmount: real("price_amount").notNull(),
    compareAtPrice: real("compare_at_price"),
    priceCurrency: varchar("price_currency", { length: 10 })
      .notNull()
      .default("BDT"),
    availableForSale: boolean("available_for_sale").notNull().default(true),
    inventoryQuantity: integer("inventory_quantity").notNull().default(15),
    unit: productUnitEnum("unit").notNull().default("packet"),
    position: integer("position").notNull().default(0),
    selectedOptions: jsonb("selected_options")
      .$type<{ name: string; value: string }[]>()
      .notNull()
      .default([]),
  },
  (table) => [index("product_variants_product_idx").on(table.productId)],
);

export const productCollections = pgTable(
  "product_collections",
  {
    productId: varchar("product_id", { length: 255 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    collectionId: varchar("collection_id", { length: 255 })
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.collectionId] }),
    index("product_collections_collection_idx").on(table.collectionId),
    index("product_collections_product_idx").on(table.productId),
  ],
);

export const menus = pgTable(
  "menus",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    handle: varchar("handle", { length: 255 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    path: text("path").notNull(),
    position: integer("position").notNull().default(0),
  },
  (table) => [index("menus_handle_idx").on(table.handle)],
);

export const pages = pgTable(
  "pages",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    handle: varchar("handle", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    body: text("body").notNull(),
    bodySummary: text("body_summary").notNull().default(""),
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: text("seo_description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("pages_handle_idx").on(table.handle)],
);

export const blogs = pgTable(
  "blogs",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    content: text("content").notNull(),
    category: varchar("category", { length: 100 })
      .notNull()
      .default("মধু ও পুষ্টি"),
    readTime: varchar("read_time", { length: 50 }).notNull().default("৫ মিনিট"),
    author: varchar("author", { length: 100 })
      .notNull()
      .default("স্বাস্থ্যকর নিউট্রিশন টিম"),
    coverImage: text("cover_image").notNull(),
    inArticleImageUrl: text("in_article_image_url"),
    inArticleImageCaption: text("in_article_image_caption"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    faqs: jsonb("faqs")
      .$type<{ question: string; answer: string }[]>()
      .notNull()
      .default([]),
    relatedProductHandles: jsonb("related_product_handles")
      .$type<string[]>()
      .notNull()
      .default([]),
    published: boolean("published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("blogs_slug_idx").on(table.slug),
    index("blogs_published_created_at_idx").on(
      table.published,
      table.createdAt,
    ),
    index("blogs_category_idx").on(table.category),
  ],
);

export type Blog = typeof blogs.$inferSelect;

export const carts = pgTable("carts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const cartItems = pgTable(
  "cart_items",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    cartId: varchar("cart_id", { length: 255 })
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: varchar("product_id", { length: 255 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: varchar("variant_id", { length: 255 })
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("cart_items_cart_idx").on(table.cartId),
    index("cart_items_product_idx").on(table.productId),
    index("cart_items_variant_idx").on(table.variantId),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    customerName: varchar("customer_name", { length: 255 }),
    shippingAddress: text("shipping_address"),
    paymentMethod: varchar("payment_method", { length: 50 })
      .notNull()
      .default("online"), // 'online' (bkash/nagad/card etc)

    paymentStatus: varchar("payment_status", { length: 50 })
      .notNull()
      .default("pending"), // 'pending' | 'paid' | 'failed'
    paymentInvoiceId: varchar("payment_invoice_id", { length: 255 }),
    paymentTrxId: varchar("payment_trx_id", { length: 255 }),
    paymentSenderNumber: varchar("payment_sender_number", { length: 50 }),
    couponCode: varchar("coupon_code", { length: 50 }),
    discountAmount: real("discount_amount").default(0),
    totalAmount: real("total_amount").notNull(),
    totalCurrency: varchar("total_currency", { length: 10 })
      .notNull()
      .default("BDT"),
    status: varchar("status", { length: 50 }).notNull().default("confirmed"),

    items: jsonb("items")
      .$type<
        {
          productHandle: string;
          productTitle: string;
          variantTitle: string;
          quantity: number;
          priceAmount: number;
          priceCurrency: string;
        }[]
      >()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("orders_created_at_idx").on(table.createdAt),
    index("orders_email_idx").on(table.email),
    index("orders_status_idx").on(table.status),
    index("orders_payment_invoice_idx").on(table.paymentInvoiceId),
  ],
);

export type OrderModel = typeof orders.$inferSelect;

// ─── Authentication Schema ──────────────────────────────────────────────────

export const users = pgTable("users", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  avatarUrl: text("avatar_url"),
  phone: varchar("phone", { length: 50 }),
  isBanned: boolean("is_banned").notNull().default(false),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 50 }).notNull(), // 'email', 'google'
    providerAccountId: varchar("provider_account_id", { length: 255 }),
    providerUsername: varchar("provider_username", { length: 255 }),
    passwordHash: text("password_hash"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("accounts_user_idx").on(table.userId),
    index("accounts_provider_account_idx").on(
      table.provider,
      table.providerAccountId,
    ),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    ipAddress: varchar("ip_address", { length: 100 }),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("sessions_user_idx").on(table.userId),
    index("sessions_token_idx").on(table.token),
  ],
);

export const magicLinkTokens = pgTable(
  "magic_link_tokens",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: varchar("email", { length: 255 }).notNull(),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("magic_link_email_idx").on(table.email),
    index("magic_link_token_idx").on(table.token),
  ],
);

export const coupons = pgTable(
  "coupons",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    code: varchar("code", { length: 50 }).notNull().unique(),
    discountType: varchar("discount_type", { length: 20 })
      .notNull()
      .default("percentage"), // 'percentage' | 'fixed'
    discountValue: real("discount_value").notNull(),
    minOrderAmount: real("min_order_amount").notNull().default(0),
    maxDiscountAmount: real("max_discount_amount"),
    usageLimit: integer("usage_limit"),
    usedCount: integer("used_count").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("coupons_code_idx").on(table.code)],
);

export const productReviews = pgTable(
  "product_reviews",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: varchar("product_id", { length: 255 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    userName: varchar("user_name", { length: 255 }).notNull(),
    userAvatar: text("user_avatar"),
    rating: integer("rating").notNull().default(5),
    comment: text("comment").notNull(),
    approved: boolean("approved").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("product_reviews_product_idx").on(table.productId),
    index("product_reviews_user_idx").on(table.userId),
  ],
);

export const heroBanners = pgTable(
  "hero_banners",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: varchar("title", { length: 255 }).notNull(),
    highlight: varchar("highlight", { length: 255 }).notNull(),
    subtitle: text("subtitle").notNull(),
    link: text("link").notNull().default("/search"),
    accentColor: varchar("accent_color", { length: 50 })
      .notNull()
      .default("text-amber-400"),
    image: text("image").notNull(),
    position: integer("position").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("hero_banners_active_position_idx").on(table.active, table.position),
  ],
);

export const storeSettings = pgTable("store_settings", {
  id: varchar("id", { length: 50 }).primaryKey().default("default"),
  storeName: varchar("store_name", { length: 255 })
    .notNull()
    .default("স্বাস্থ্যকর"),
  storePhone: varchar("store_phone", { length: 50 })
    .notNull()
    .default("01812345678"),
  whatsappNumber: varchar("whatsapp_number", { length: 50 })
    .notNull()
    .default("8801812345678"),
  storeEmail: varchar("store_email", { length: 255 })
    .notNull()
    .default("support@swasthyokor.com"),
  storeAddress: text("store_address").notNull().default("ঢাকা, বাংলাদেশ"),
  insideDhakaFee: real("inside_dhaka_fee").notNull().default(60),
  outsideDhakaFee: real("outside_dhaka_fee").notNull().default(120),
  freeShippingMinAmount: real("free_shipping_min_amount")
    .notNull()
    .default(1500),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type StoreSettings = typeof storeSettings.$inferSelect;
export type ProductReview = typeof productReviews.$inferSelect;
export type HeroBanner = typeof heroBanners.$inferSelect;

// ---- relations ----

export const productsRelations = relations(products, ({ many }) => ({
  images: many(productImages),
  options: many(productOptions),
  variants: many(productVariants),
  collections: many(productCollections),
  reviews: many(productReviews),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productOptionsRelations = relations(productOptions, ({ one }) => ({
  product: one(products, {
    fields: [productOptions.productId],
    references: [products.id],
  }),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
  }),
);

export const productCollectionsRelations = relations(
  productCollections,
  ({ one }) => ({
    product: one(products, {
      fields: [productCollections.productId],
      references: [products.id],
    }),
    collection: one(collections, {
      fields: [productCollections.collectionId],
      references: [collections.id],
    }),
  }),
);

export const collectionsRelations = relations(collections, ({ many }) => ({
  products: many(productCollections),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(products, {
    fields: [productReviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [productReviews.userId],
    references: [users.id],
  }),
}));

export const cartsRelations = relations(carts, ({ many }) => ({
  items: many(cartItems),
}));
