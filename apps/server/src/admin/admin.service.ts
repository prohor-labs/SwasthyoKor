import { Injectable, NotFoundException } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DrizzleService } from '../drizzle/drizzle.service.js';
import {
  blogs,
  collections,
  coupons,
  heroBanners,
  orders,
  productCollections,
  productImages,
  productOptions,
  products,
  productVariants,
  storeSettings,
  users,
} from '../drizzle/schema.js';
import { StorageService } from '../storage/storage.service.js';

@Injectable()
export class AdminService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly storage: StorageService,
  ) {}

  // Products
  async getAllProducts() {
    return this.drizzle.db.query.products.findMany({
      with: {
        images: true,
        variants: true,
        collections: { with: { collection: true } },
      },
      orderBy: (p, { desc: d }) => [d(p.createdAt)],
    });
  }

  async createProduct(data: {
    title: string;
    handle: string;
    description: string;
    collectionId?: string;
    imageUrl?: string;
    variants?: any[];
  }) {
    const id = `prod_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date();

    const [newProduct] = await this.drizzle.db
      .insert(products)
      .values({
        id,
        title: data.title,
        handle: data.handle,
        description: data.description,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const imageUrl =
      data.imageUrl ||
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800';

    await this.drizzle.db.insert(productImages).values({
      id: crypto.randomUUID(),
      productId: id,
      url: imageUrl,
      altText: data.title,
      width: 800,
      height: 800,
      position: 0,
    });

    const variantsList = data.variants?.length
      ? data.variants
      : [
          {
            title: 'স্ট্যান্ডার্ড প্যাক',
            priceAmount: 0,
            inventoryQuantity: 15,
            unit: 'packet',
          },
        ];

    for (const v of variantsList) {
      await this.drizzle.db.insert(productVariants).values({
        id: crypto.randomUUID(),
        productId: id,
        title: v.title,
        priceAmount: Number(v.priceAmount || v.price || 0),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
        inventoryQuantity: Number(v.inventoryQuantity ?? 15),
        unit: v.unit || 'packet',
        availableForSale: true,
      });
    }

    if (data.collectionId) {
      await this.drizzle.db.insert(productCollections).values({
        productId: id,
        collectionId: data.collectionId,
      });
    }

    return newProduct;
  }

  async deleteProduct(productId: string) {
    await this.drizzle.db.delete(products).where(eq(products.id, productId));
    return { success: true };
  }

  async toggleProductAvailability(productId: string, available: boolean) {
    await this.drizzle.db
      .update(products)
      .set({ availableForSale: available, updatedAt: new Date() })
      .where(eq(products.id, productId));
    return { success: true };
  }

  // Orders
  async getAllOrders() {
    return this.drizzle.db.query.orders.findMany({
      orderBy: (o, { desc: d }) => [d(o.createdAt)],
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    await this.drizzle.db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId));
    return { success: true };
  }

  // Collections
  async getAllCollections() {
    return this.drizzle.db.query.collections.findMany({
      orderBy: (c, { asc: a }) => [a(c.displayOrder)],
    });
  }

  async createCollection(data: {
    title: string;
    handle: string;
    description?: string;
    image?: string;
  }) {
    const id = `col_${crypto.randomUUID().slice(0, 8)}`;
    const [col] = await this.drizzle.db
      .insert(collections)
      .values({
        id,
        title: data.title,
        handle: data.handle,
        description: data.description,
        image: data.image,
      })
      .returning();
    return col;
  }

  async deleteCollection(collectionId: string) {
    await this.drizzle.db.delete(collections).where(eq(collections.id, collectionId));
    return { success: true };
  }

  // Customers
  async getAllCustomers() {
    return this.drizzle.db.query.users.findMany({
      orderBy: (u, { desc: d }) => [d(u.createdAt)],
    });
  }

  async toggleCustomerBan(userId: string, isBanned: boolean) {
    await this.drizzle.db
      .update(users)
      .set({ isBanned, updatedAt: new Date() })
      .where(eq(users.id, userId));
    return { success: true };
  }

  // Coupons
  async getAllCoupons() {
    return this.drizzle.db.query.coupons.findMany({
      orderBy: (c, { desc: d }) => [d(c.createdAt)],
    });
  }

  async createCoupon(data: any) {
    const id = crypto.randomUUID();
    const [coupon] = await this.drizzle.db
      .insert(coupons)
      .values({
        id,
        code: data.code.toUpperCase(),
        discountType: data.discountType || 'percentage',
        discountValue: Number(data.discountValue),
        minOrderAmount: Number(data.minOrderAmount || 0),
        maxDiscountAmount: data.maxDiscountAmount ? Number(data.maxDiscountAmount) : null,
        usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
        isActive: true,
      })
      .returning();
    return coupon;
  }

  async deleteCoupon(id: string) {
    await this.drizzle.db.delete(coupons).where(eq(coupons.id, id));
    return { success: true };
  }

  // Banners
  async getAllBanners() {
    return this.drizzle.db.query.heroBanners.findMany({
      orderBy: (b, { asc: a }) => [a(b.position)],
    });
  }

  async createBanner(data: any) {
    const id = crypto.randomUUID();
    const [b] = await this.drizzle.db
      .insert(heroBanners)
      .values({
        id,
        title: data.title,
        highlight: data.highlight,
        subtitle: data.subtitle,
        link: data.link || '/search',
        image: data.image,
        accentColor: data.accentColor || 'text-amber-400',
        position: Number(data.position || 0),
        active: true,
      })
      .returning();
    return b;
  }

  async deleteBanner(id: string) {
    await this.drizzle.db.delete(heroBanners).where(eq(heroBanners.id, id));
    return { success: true };
  }

  // Settings
  async updateSettings(data: any) {
    await this.drizzle.db
      .insert(storeSettings)
      .values({
        id: 'default',
        ...data,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: storeSettings.id,
        set: { ...data, updatedAt: new Date() },
      });

    return { success: true };
  }
}
