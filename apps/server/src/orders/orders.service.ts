import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, gt, isNull, or, sql } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { DrizzleService } from '../drizzle/drizzle.service.js';
import {
  cartItems,
  carts,
  coupons,
  orders,
  productVariants,
  products,
} from '../drizzle/schema.js';
import { CartService, CART_COOKIE } from '../cart/cart.service.js';
import { PaymentService } from '../payment/payment.service.js';
import { SessionService, SESSION_COOKIE } from '../auth/session.service.js';
import type { Order } from '../types.js';

@Injectable()
export class OrdersService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly cartService: CartService,
    private readonly paymentService: PaymentService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
  ) {}

  async getOrder(id: string): Promise<Order | null> {
    const row = await this.drizzle.db.query.orders.findFirst({
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

  async checkoutCart(
    req: Request,
    res: Response,
    body: { address?: string; phone?: string; customerName?: string },
  ): Promise<{ paymentUrl?: string; orderId: string; success?: boolean; redirectUrl?: string }> {
    const cartId = req.cookies?.[CART_COOKIE];
    const cart = cartId ? await this.cartService.getCart(cartId) : null;
    if (!cart || cart.lines.length === 0) {
      throw new BadRequestException('কার্ট খালি।');
    }

    const token = req.cookies?.[SESSION_COOKIE];
    const user = await this.sessionService.getUserByToken(token);

    const now = new Date();
    const orderId = crypto.randomUUID();
    const totalAmount = Number(cart.cost.totalAmount.amount);
    const totalCurrency = cart.cost.totalAmount.currencyCode;

    await this.drizzle.db.insert(orders).values({
      id: orderId,
      email: user?.email || null,
      customerName: body.customerName || user?.name || null,
      phone: body.phone || user?.phone || null,
      shippingAddress: body.address || null,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      totalAmount,
      totalCurrency,
      status: 'pending',
      items: cart.lines.map((line) => ({
        productHandle: line.merchandise.product.handle,
        productTitle: line.merchandise.product.title,
        variantTitle: line.merchandise.title,
        quantity: line.quantity,
        priceAmount: Number(line.cost.totalAmount.amount) / line.quantity,
        priceCurrency: line.cost.totalAmount.currencyCode,
      })),
      createdAt: now,
      updatedAt: now,
    });

    // Auto-deduct inventory
    for (const line of cart.lines) {
      if (line.merchandise.id) {
        await this.drizzle.db
          .update(productVariants)
          .set({
            inventoryQuantity: sql`GREATEST(0, ${productVariants.inventoryQuantity} - ${line.quantity})`,
            availableForSale: sql`CASE WHEN ${productVariants.inventoryQuantity} - ${line.quantity} <= 0 THEN false ELSE ${productVariants.availableForSale} END`,
          })
          .where(eq(productVariants.id, line.merchandise.id));
      }
    }

    // Clear cart
    if (cartId) {
      await this.drizzle.db.delete(cartItems).where(eq(cartItems.cartId, cartId));
      await this.drizzle.db.delete(carts).where(eq(carts.id, cartId));
      res.clearCookie(CART_COOKIE, { path: '/' });
    }

    const appUrl = this.configService.get<string>('APP_URL') || 'https://localhost:8002';
    return { orderId, success: true, redirectUrl: `${appUrl}/order/${orderId}?success=true` };
  }

  async checkoutDirect(
    req: Request,
    body: {
      handle: string;
      quantity?: number;
      name?: string;
      phone?: string;
      address?: string;
      couponCode?: string;
    },
  ): Promise<{ paymentUrl?: string; orderId: string; success?: boolean; redirectUrl?: string }> {
    const handle = body.handle;
    const quantity = Math.max(1, Number(body.quantity || 1));
    const name = body.name?.trim() || '';
    const phone = body.phone?.trim() || '';
    const address = body.address?.trim() || '';
    const couponCode = body.couponCode?.trim().toUpperCase() || '';

    if (!handle) {
      throw new BadRequestException('পণ্য নির্দিষ্ট করা নেই।');
    }

    const product = await this.drizzle.db.query.products.findFirst({
      where: eq(products.handle, handle),
      with: { variants: true },
    });

    if (!product || !product.variants.length) {
      throw new NotFoundException('পণ্য পাওয়া যায়নি।');
    }

    const variant = product.variants[0];
    const priceAmount = variant.priceAmount;
    const priceCurrency = variant.priceCurrency;
    const variantTitle = variant.title;

    const rawSubtotal = priceAmount * quantity;
    let discountAmount = 0;
    let validatedCouponCode: string | null = null;

    if (couponCode) {
      const [coupon] = await this.drizzle.db
        .select()
        .from(coupons)
        .where(
          and(
            eq(coupons.code, couponCode),
            eq(coupons.isActive, true),
            or(isNull(coupons.expiresAt), gt(coupons.expiresAt, new Date())),
          ),
        )
        .limit(1);

      if (
        coupon &&
        (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
        rawSubtotal >= coupon.minOrderAmount
      ) {
        if (coupon.discountType === 'percentage') {
          discountAmount = (rawSubtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
        discountAmount = Math.min(discountAmount, rawSubtotal);
        validatedCouponCode = coupon.code;
      }
    }

    const finalTotalAmount = Math.max(1, rawSubtotal - discountAmount);
    const now = new Date();
    const orderId = crypto.randomUUID();

    const token = req.cookies?.[SESSION_COOKIE];
    const user = await this.sessionService.getUserByToken(token);

    await this.drizzle.db.insert(orders).values({
      id: orderId,
      email: user?.email || null,
      customerName: name || user?.name || null,
      phone: phone || user?.phone || null,
      shippingAddress: address || null,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      couponCode: validatedCouponCode,
      discountAmount,
      totalAmount: finalTotalAmount,
      totalCurrency: priceCurrency,
      status: 'pending',
      items: [
        {
          productHandle: product.handle,
          productTitle: product.title,
          variantTitle,
          quantity,
          priceAmount,
          priceCurrency,
        },
      ],
      createdAt: now,
      updatedAt: now,
    });

    if (variant.id) {
      await this.drizzle.db
        .update(productVariants)
        .set({
          inventoryQuantity: sql`GREATEST(0, ${productVariants.inventoryQuantity} - ${quantity})`,
          availableForSale: sql`CASE WHEN ${productVariants.inventoryQuantity} - ${quantity} <= 0 THEN false ELSE ${productVariants.availableForSale} END`,
        })
        .where(eq(productVariants.id, variant.id));
    }

    const appUrl = this.configService.get<string>('APP_URL') || 'https://localhost:8002';
    return { orderId, success: true, redirectUrl: `${appUrl}/order/${orderId}?success=true` };
  }
}
