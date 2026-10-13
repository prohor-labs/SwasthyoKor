"use server";

import { and, eq, gt, isNull, or, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../auth/session";
import { db } from "../db";
import { CART_COOKIE, getCart } from "../db/cart";
import {
  cartItems,
  carts,
  coupons,
  orders,
  productVariants,
  products,
} from "../db/schema";

export async function checkout(): Promise<void> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE)?.value;
  const cart = cartId ? await getCart(cartId) : null;

  if (!cart || cart.lines.length === 0) {
    throw new Error("কার্ট খালি।");
  }

  const user = await getCurrentUser();
  const now = new Date();
  const orderId = crypto.randomUUID();
  const totalAmount = Number(cart.cost.totalAmount.amount);
  const totalCurrency = cart.cost.totalAmount.currencyCode;

  await db.insert(orders).values({
    id: orderId,
    email: user?.email || null,
    customerName: user?.name || null,
    phone: user?.phone || null,
    shippingAddress: null,
    paymentMethod: "cod",
    paymentStatus: "pending",
    totalAmount,
    totalCurrency,
    status: "pending",
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
      await db
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
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
    await db.delete(carts).where(eq(carts.id, cartId));
    cookieStore.delete(CART_COOKIE);
  }

  redirect(`/order/${orderId}?success=true`);
}

export async function checkoutDirectProduct(formData: FormData): Promise<void> {
  const handle = formData.get("handle") as string;
  const quantity = Math.max(1, Number(formData.get("quantity") || 1));
  const name = (formData.get("name") as string)?.trim() || "";
  const phone = (formData.get("phone") as string)?.trim() || "";
  const address = (formData.get("address") as string)?.trim() || "";
  const couponCode =
    (formData.get("couponCode") as string)?.trim().toUpperCase() || "";

  if (!handle) {
    throw new Error("পণ্য নির্দিষ্ট করা নেই।");
  }

  const product = await db.query.products.findFirst({
    where: eq(products.handle, handle),
    with: { variants: true },
  });

  if (!product || !product.variants.length) {
    throw new Error("পণ্য পাওয়া যায়নি।");
  }

  const variant = product.variants[0];
  const priceAmount = variant.priceAmount;
  const priceCurrency = variant.priceCurrency;
  const variantTitle = variant.title;

  const rawSubtotal = priceAmount * quantity;
  let discountAmount = 0;
  let validatedCouponCode: string | null = null;

  if (couponCode && product.allowCoupons !== false) {
    const [coupon] = await db
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
      if (coupon.discountType === "percentage") {
        discountAmount = (rawSubtotal * coupon.discountValue) / 100;
        if (
          coupon.maxDiscountAmount &&
          discountAmount > coupon.maxDiscountAmount
        ) {
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

  const user = await getCurrentUser();

  await db.insert(orders).values({
    id: orderId,
    email: user?.email || null,
    customerName: name || user?.name || null,
    phone: phone || user?.phone || null,
    shippingAddress: address || null,
    paymentMethod: "cod",
    paymentStatus: "pending",
    couponCode: validatedCouponCode,
    discountAmount,
    totalAmount: finalTotalAmount,
    totalCurrency: priceCurrency,
    status: "pending",
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
    await db
      .update(productVariants)
      .set({
        inventoryQuantity: sql`GREATEST(0, ${productVariants.inventoryQuantity} - ${quantity})`,
        availableForSale: sql`CASE WHEN ${productVariants.inventoryQuantity} - ${quantity} <= 0 THEN false ELSE ${productVariants.availableForSale} END`,
      })
      .where(eq(productVariants.id, variant.id));
  }

  redirect(`/order/${orderId}?success=true`);
}
