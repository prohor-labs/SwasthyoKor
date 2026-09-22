"use server";

import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getCart } from "@/lib/db/queries";
import { cartItems, carts, productVariants } from "@/lib/db/schema";
import type { Cart } from "@/lib/types";

const CART_COOKIE = "cartId";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function getOrCreateCartId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_COOKIE)?.value;
  if (existing) return existing;

  const id = crypto.randomUUID();
  const now = new Date();

  await db.insert(carts).values({ id, createdAt: now, updatedAt: now });
  cookieStore.set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });

  return id;
}

async function getCartIdFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_COOKIE)?.value;
}

export async function getCartFromCookie(): Promise<Cart | null> {
  return getCart(await getCartIdFromCookie());
}

export async function addItem(variantId: string, quantity = 1): Promise<void> {
  const cartId = await getOrCreateCartId();
  const variant = await db.query.productVariants.findFirst({
    where: eq(productVariants.id, variantId),
  });
  if (!variant) return;

  const now = new Date();
  const existing = await db.query.cartItems.findFirst({
    where: and(
      eq(cartItems.cartId, cartId),
      eq(cartItems.variantId, variantId),
    ),
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
}

export async function updateItemQuantity(
  variantId: string,
  type: "plus" | "minus" | "delete",
): Promise<void> {
  const cartId = await getCartIdFromCookie();
  if (!cartId) return;

  const item = await db.query.cartItems.findFirst({
    where: and(
      eq(cartItems.cartId, cartId),
      eq(cartItems.variantId, variantId),
    ),
  });
  if (!item) return;

  const now = new Date();

  if (type === "delete") {
    await db.delete(cartItems).where(eq(cartItems.id, item.id));
  } else {
    const nextQuantity =
      type === "plus" ? item.quantity + 1 : item.quantity - 1;

    if (nextQuantity <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, item.id));
    } else {
      await db
        .update(cartItems)
        .set({ quantity: nextQuantity, updatedAt: now })
        .where(eq(cartItems.id, item.id));
    }
  }

  await db.update(carts).set({ updatedAt: now }).where(eq(carts.id, cartId));
}

export async function removeItem(variantId: string): Promise<void> {
  await updateItemQuantity(variantId, "delete");
}
