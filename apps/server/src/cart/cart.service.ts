import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { DrizzleService } from '../drizzle/drizzle.service.js';
import { cartItems, carts, productVariants } from '../drizzle/schema.js';
import type { Cart, CartItem } from '../types.js';

export const CART_COOKIE = 'cartId';
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 * 1000; // 30 days in ms

function money(amount: number, currencyCode = 'BDT') {
  return { amount: amount.toFixed(2), currencyCode };
}

@Injectable()
export class CartService {
  constructor(private readonly drizzle: DrizzleService) {}

  async getOrCreateCartId(req: Request, res: Response): Promise<string> {
    const existing = req.cookies?.[CART_COOKIE];
    if (existing) {
      const cart = await this.drizzle.db.query.carts.findFirst({
        where: eq(carts.id, existing),
      });
      if (cart) return existing;
    }

    const id = crypto.randomUUID();
    const now = new Date();

    await this.drizzle.db.insert(carts).values({ id, createdAt: now, updatedAt: now });

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie(CART_COOKIE, id, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: CART_COOKIE_MAX_AGE,
    });

    return id;
  }

  async getCart(cartId?: string | null): Promise<Cart | null> {
    if (!cartId) return null;

    const cart = await this.drizzle.db.query.carts.findFirst({
      where: eq(carts.id, cartId),
    });
    if (!cart) return null;

    const items = await this.drizzle.db.query.cartItems.findMany({
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
    const currencyCode = lines[0]?.cost.totalAmount.currencyCode ?? 'BDT';

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

  async addItem(variantId: string, quantity = 1, req: Request, res: Response): Promise<Cart | null> {
    const cartId = await this.getOrCreateCartId(req, res);
    const variant = await this.drizzle.db.query.productVariants.findFirst({
      where: eq(productVariants.id, variantId),
    });
    if (!variant) {
      throw new NotFoundException('ভ্যারিয়েন্ট পাওয়া যায়নি।');
    }

    const now = new Date();
    const existing = await this.drizzle.db.query.cartItems.findFirst({
      where: and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId)),
    });

    if (existing) {
      await this.drizzle.db
        .update(cartItems)
        .set({ quantity: existing.quantity + quantity, updatedAt: now })
        .where(eq(cartItems.id, existing.id));
    } else {
      await this.drizzle.db.insert(cartItems).values({
        id: crypto.randomUUID(),
        cartId,
        productId: variant.productId,
        variantId,
        quantity,
        createdAt: now,
        updatedAt: now,
      });
    }

    await this.drizzle.db.update(carts).set({ updatedAt: now }).where(eq(carts.id, cartId));
    return this.getCart(cartId);
  }

  async updateItemQuantity(
    variantId: string,
    type: 'plus' | 'minus' | 'delete',
    req: Request,
  ): Promise<Cart | null> {
    const cartId = req.cookies?.[CART_COOKIE];
    if (!cartId) return null;

    const item = await this.drizzle.db.query.cartItems.findFirst({
      where: and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId)),
    });
    if (!item) return this.getCart(cartId);

    const now = new Date();

    if (type === 'delete') {
      await this.drizzle.db.delete(cartItems).where(eq(cartItems.id, item.id));
    } else {
      const nextQuantity = type === 'plus' ? item.quantity + 1 : item.quantity - 1;
      if (nextQuantity <= 0) {
        await this.drizzle.db.delete(cartItems).where(eq(cartItems.id, item.id));
      } else {
        await this.drizzle.db
          .update(cartItems)
          .set({ quantity: nextQuantity, updatedAt: now })
          .where(eq(cartItems.id, item.id));
      }
    }

    await this.drizzle.db.update(carts).set({ updatedAt: now }).where(eq(carts.id, cartId));
    return this.getCart(cartId);
  }
}
