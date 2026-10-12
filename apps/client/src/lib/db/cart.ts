import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "./index";
import {
  cartItems,
  carts,
  productVariants,
  type productImages,
} from "./schema";
import type { Cart, CartItem } from "@/types";

export const CART_COOKIE = "cartId";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

function money(amount: number, currencyCode = "BDT") {
  return { amount: amount.toFixed(2), currencyCode };
}

export async function getOrCreateCartId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_COOKIE)?.value;
  if (existing) {
    const cart = await db.query.carts.findFirst({
      where: eq(carts.id, existing),
    });
    if (cart) return existing;
  }

  const id = crypto.randomUUID();
  const now = new Date();

  await db.insert(carts).values({ id, createdAt: now, updatedAt: now });

  const isProduction = process.env.NODE_ENV === "production";
  cookieStore.set(CART_COOKIE, id, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });

  return id;
}

export const getCart = cache(async (cartIdParam?: string | null): Promise<Cart | null> => {
  let cartId = cartIdParam;
  if (!cartId) {
    const cookieStore = await cookies();
    cartId = cookieStore.get(CART_COOKIE)?.value ?? null;
  }
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
});

export async function addItemToCart(variantId: string, quantity = 1): Promise<Cart | null> {
  const cartId = await getOrCreateCartId();
  const variant = await db.query.productVariants.findFirst({
    where: eq(productVariants.id, variantId),
  });
  if (!variant) {
    throw new Error("ভ্যারিয়েন্ট পাওয়া যায়নি।");
  }

  const now = new Date();
  const existing = await db.query.cartItems.findFirst({
    where: and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId)),
  });

  if (existing) {
    await db
      .update(cartItems)
      .set({ quantity: existing.quantity + quantity, updatedAt: now })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({
      id: crypto.randomUUID(),
      cartId,
      productId: variant.productId,
      variantId,
      quantity,
      createdAt: now,
      updatedAt: now,
    });
  }

  await db.update(carts).set({ updatedAt: now }).where(eq(carts.id, cartId));
  return getCart(cartId);
}

export async function updateItemQuantityInCart(
  variantId: string,
  type: "plus" | "minus" | "delete",
): Promise<Cart | null> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE)?.value;
  if (!cartId) return null;

  const item = await db.query.cartItems.findFirst({
    where: and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId)),
  });
  if (!item) return getCart(cartId);

  const now = new Date();
  if (type === "delete" || (type === "minus" && item.quantity <= 1)) {
    await db.delete(cartItems).where(eq(cartItems.id, item.id));
  } else {
    const newQuantity = type === "plus" ? item.quantity + 1 : item.quantity - 1;
    await db
      .update(cartItems)
      .set({ quantity: newQuantity, updatedAt: now })
      .where(eq(cartItems.id, item.id));
  }

  await db.update(carts).set({ updatedAt: now }).where(eq(carts.id, cartId));
  return getCart(cartId);
}
