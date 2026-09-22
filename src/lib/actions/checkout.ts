"use server";

import { eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getCart } from "@/lib/db/queries";
import { cartItems, carts, orders, productVariants } from "@/lib/db/schema";
import { createPaymentCharge } from "@/lib/uddoktapay";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://swasthyokor.prohor.dev";

export async function checkout(): Promise<void> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;
  const cart = cartId ? await getCart(cartId) : null;
  const user = await getCurrentUser();

  if (!cartId || !cart || cart.lines.length === 0) {
    redirect("/search");
  }

  const now = new Date();
  const orderId = crypto.randomUUID();
  const totalAmount = Number(cart.cost.totalAmount.amount);
  const totalCurrency = cart.cost.totalAmount.currencyCode;

  // Insert order in pending state until paid
  await db.insert(orders).values({
    id: orderId,
    email: user?.email || null,
    customerName: user?.name || null,
    phone: user?.phone || null,
    paymentMethod: "online",
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

  // Auto-deduct stock quantity for ordered cart variants
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
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  await db.delete(carts).where(eq(carts.id, cartId));
  cookieStore.delete("cartId");

  let paymentUrl = "";
  try {
    const charge = await createPaymentCharge({
      fullName: user?.name || "Customer",
      email: user?.email || "customer@swasthyokor.com",
      amount: totalAmount,
      metadata: {
        order_id: orderId,
      },
      redirectUrl: `${APP_URL}/payment/callback?order_id=${orderId}`,
      cancelUrl: `${APP_URL}/order/${orderId}?payment=cancelled`,
      webhookUrl: `${APP_URL}/api/payment/webhook`,
      returnType: "GET",
    });
    paymentUrl = charge.paymentUrl;
  } catch (err) {
    console.error("Failed to initiate UddoktaPay charge for cart:", err);
    redirect(`/order/${orderId}?payment=failed`);
  }

  if (paymentUrl) {
    redirect(paymentUrl);
  }

  redirect(`/order/${orderId}`);
}

export async function checkoutDirectProduct(formData: FormData): Promise<void> {
  const handle = formData.get("handle") as string;
  const rawQuantity = Math.max(1, Number(formData.get("quantity") || 1));
  const name = (formData.get("name") as string)?.trim() || "";
  const phone = (formData.get("phone") as string)?.trim() || "";
  const address = (formData.get("address") as string)?.trim() || "";
  const couponCode =
    (formData.get("couponCode") as string)?.trim().toUpperCase() || "";

  if (!handle) {
    redirect("/search");
  }

  const user = await getCurrentUser();
  const { getProduct } = await import("@/lib/db/queries");
  const product = await getProduct(handle);

  if (!product) {
    redirect("/search");
  }

  const quantity = rawQuantity;
  const variant = product.variants[0];
  const priceAmount = variant
    ? Number(variant.price.amount)
    : Number(product.priceRange.minVariantPrice.amount);
  const priceCurrency = variant
    ? variant.price.currencyCode
    : product.priceRange.minVariantPrice.currencyCode;
  const variantTitle = variant?.title || "Default Title";

  const rawSubtotal = priceAmount * quantity;
  let discountAmount = 0;
  let validatedCouponCode: string | null = null;

  if (couponCode) {
    const { coupons } = await import("@/lib/db/schema");
    const { and, eq, gt, or, isNull } = await import("drizzle-orm");
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

  await db.insert(orders).values({
    id: orderId,
    email: user?.email || null,
    customerName: name || user?.name || null,
    phone: phone || user?.phone || null,
    shippingAddress: address || null,
    paymentMethod: "online",
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

  // Deduct stock from variant inventory
  if (variant?.id) {
    await db
      .update(productVariants)
      .set({
        inventoryQuantity: sql`GREATEST(0, ${productVariants.inventoryQuantity} - ${quantity})`,
        availableForSale: sql`CASE WHEN ${productVariants.inventoryQuantity} - ${quantity} <= 0 THEN false ELSE ${productVariants.availableForSale} END`,
      })
      .where(eq(productVariants.id, variant.id));
  }

  // Redirect to UddoktaPay
  let paymentUrl = "";
  try {
    const charge = await createPaymentCharge({
      fullName: name || "Customer",
      email: user?.email || "customer@swasthyokor.com",
      amount: finalTotalAmount,
      metadata: {
        order_id: orderId,
      },
      redirectUrl: `${APP_URL}/payment/callback?order_id=${orderId}`,
      cancelUrl: `${APP_URL}/order/${orderId}?payment=cancelled`,
      webhookUrl: `${APP_URL}/api/payment/webhook`,
      returnType: "GET",
    });
    paymentUrl = charge.paymentUrl;
  } catch (err) {
    console.error("Failed to initiate UddoktaPay charge:", err);
    redirect(`/order/${orderId}?payment=failed`);
  }

  if (paymentUrl) {
    redirect(paymentUrl);
  }

  redirect(`/order/${orderId}`);
}

