"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../auth/session";
import { db } from "../db";
import {
  blogs,
  collections,
  coupons,
  heroBanners,
  orders,
  productCollections,
  productImages,
  products,
  productVariants,
  storeSettings,
  users,
} from "../db/schema";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    throw new Error("অননুমোদিত অ্যাক্সেস। শুধুমাত্র অ্যাডমিনরা এই পরিবর্তন করতে পারবেন।");
  }
  return user;
}

export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    await requireAdmin();
    await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    revalidatePath("/admin/orders");
    return { success: true, error: "" };
  } catch (err: any) {
    return { success: false, error: err.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।" };
  }
}

export async function createProductAction(formData: FormData) {
  try {
    await requireAdmin();
    const title = (formData.get("title") as string)?.trim();
    const handle = (formData.get("handle") as string)?.trim() || title?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const description = (formData.get("description") as string)?.trim() || "";
    const price = Number(formData.get("price") || 0);
    const imageUrl = (formData.get("imageUrl") as string)?.trim();
    const collectionId = formData.get("collectionId") as string;

    if (!title || !handle) {
      return { success: false, error: "পণ্যের শিরোনাম এবং হ্যান্ডেল আবশ্যক।" };
    }

    const id = `prod_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date();

    await db.insert(products).values({
      id,
      title,
      handle,
      description,
      createdAt: now,
      updatedAt: now,
    });

    if (imageUrl) {
      await db.insert(productImages).values({
        id: crypto.randomUUID(),
        productId: id,
        url: imageUrl,
        altText: title,
        width: 800,
        height: 800,
        position: 0,
      });
    }

    await db.insert(productVariants).values({
      id: crypto.randomUUID(),
      productId: id,
      title: "স্ট্যান্ডার্ড প্যাক",
      priceAmount: price,
      inventoryQuantity: 15,
      unit: "packet",
      availableForSale: true,
    });

    if (collectionId) {
      await db.insert(productCollections).values({
        productId: id,
        collectionId,
      });
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, error: "" };
  } catch (err: any) {
    return { success: false, error: err.message || "পণ্য তৈরি ব্যর্থ হয়েছে।" };
  }
}

export async function toggleProductAvailabilityAction(id: string, available: boolean) {
  try {
    await requireAdmin();
    await db
      .update(products)
      .set({ availableForSale: available, updatedAt: new Date() })
      .where(eq(products.id, id));

    revalidatePath("/admin/products");
    return { success: true, error: "" };
  } catch (err: any) {
    return { success: false, error: err.message || "অ্যাকশন ব্যর্থ হয়েছে।" };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await requireAdmin();
    await db.delete(products).where(eq(products.id, id));

    revalidatePath("/admin/products");
    return { success: true, error: "" };
  } catch (err: any) {
    return { success: false, error: err.message || "পণ্য মোছা ব্যর্থ হয়েছে।" };
  }
}

export async function createCollectionAction(formData: FormData) {
  try {
    await requireAdmin();
    const title = (formData.get("title") as string)?.trim();
    const handle = (formData.get("handle") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const image = (formData.get("image") as string)?.trim();

    if (!title || !handle) {
      return { success: false, error: "ক্যাটাগরির শিরোনাম এবং হ্যান্ডেল প্রয়োজন।" };
    }

    const id = `col_${crypto.randomUUID().slice(0, 8)}`;
    await db.insert(collections).values({
      id,
      title,
      handle,
      description,
      image,
    });

    revalidatePath("/admin/collections");
    return { success: true, error: "" };
  } catch (err: any) {
    return { success: false, error: err.message || "ক্যাটাগরি তৈরি ব্যর্থ হয়েছে।" };
  }
}

export async function toggleCollectionHomepageAction(id: string, showOnHomepage: boolean) {
  try {
    await requireAdmin();
    await db
      .update(collections)
      .set({ showOnHomepage, updatedAt: new Date() })
      .where(eq(collections.id, id));

    revalidatePath("/admin/collections");
    revalidatePath("/");
    return { success: true, error: "" };
  } catch (err: any) {
    return { success: false, error: err.message || "আপডেট ব্যর্থ হয়েছে।" };
  }
}

export async function deleteCollectionAction(id: string) {
  try {
    await requireAdmin();
    await db.delete(collections).where(eq(collections.id, id));

    revalidatePath("/admin/collections");
    return { success: true, error: "" };
  } catch (err: any) {
    return { success: false, error: err.message || "ক্যাটাগরি মোছা ব্যর্থ হয়েছে।" };
  }
}

export async function createBlogAction(formData: FormData) {
  try {
    await requireAdmin();
    const title = (formData.get("title") as string)?.trim();
    const slug = (formData.get("slug") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || "";
    const content = (formData.get("content") as string)?.trim() || "";
    const category = (formData.get("category") as string)?.trim() || "স্বাস্থ্য ও পুষ্টি";
    const coverImage = (formData.get("coverImage") as string)?.trim() || "";

    if (!title || !slug) {
      return { success: false, error: "ব্লগ শিরোনাম এবং স্লাগ আবশ্যক।" };
    }

    const id = crypto.randomUUID();
    await db.insert(blogs).values({
      id,
      title,
      slug,
      description,
      content,
      category,
      coverImage,
      published: true,
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return { success: true, error: "" };
  } catch (err: any) {
    return { success: false, error: err.message || "ব্লগ তৈরি ব্যর্থ হয়েছে।" };
  }
}

export async function deleteBlogAction(id: string) {
  try {
    await requireAdmin();
    await db.delete(blogs).where(eq(blogs.id, id));

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return { success: true, error: "" };
  } catch (err: any) {
    return { success: false, error: err.message || "ব্লগ মোছা ব্যর্থ হয়েছে।" };
  }
}

export async function createHeroBannerAction(formData: FormData) {
  try {
    await requireAdmin();
    const title = (formData.get("title") as string)?.trim();
    const highlight = (formData.get("highlight") as string)?.trim() || "";
    const subtitle = (formData.get("subtitle") as string)?.trim() || "";
    const link = (formData.get("link") as string)?.trim() || "/search";
    const image = (formData.get("image") as string)?.trim() || "";

    if (!title || !image) {
      return { success: false, error: "ব্যানারের শিরোনাম এবং ছবি আবশ্যক।" };
    }

    await db.insert(heroBanners).values({
      id: crypto.randomUUID(),
      title,
      highlight,
      subtitle,
      link,
      image,
      active: true,
    });

    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true, error: "" };
  } catch (err: any) {
    return { success: false, error: err.message || "ব্যানার তৈরি ব্যর্থ হয়েছে।" };
  }
}

export async function deleteHeroBannerAction(id: string) {
  try {
    await requireAdmin();
    await db.delete(heroBanners).where(eq(heroBanners.id, id));

    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true, error: "" };
  } catch (err: any) {
    return { success: false, error: err.message || "ব্যানার মোছা ব্যর্থ হয়েছে।" };
  }
}

export async function updateStoreSettingsAction(formData: FormData) {
  try {
    await requireAdmin();
    const storeName = (formData.get("storeName") as string)?.trim();
    const storePhone = (formData.get("storePhone") as string)?.trim();
    const whatsappNumber = (formData.get("whatsappNumber") as string)?.trim();
    const storeEmail = (formData.get("storeEmail") as string)?.trim();
    const storeAddress = (formData.get("storeAddress") as string)?.trim();
    const insideDhakaFee = Number(formData.get("insideDhakaFee") || 60);
    const outsideDhakaFee = Number(formData.get("outsideDhakaFee") || 120);
    const freeShippingMinAmount = Number(formData.get("freeShippingMinAmount") || 1500);

    await db
      .insert(storeSettings)
      .values({
        id: "default",
        storeName,
        storePhone,
        whatsappNumber,
        storeEmail,
        storeAddress,
        insideDhakaFee,
        outsideDhakaFee,
        freeShippingMinAmount,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: storeSettings.id,
        set: {
          storeName,
          storePhone,
          whatsappNumber,
          storeEmail,
          storeAddress,
          insideDhakaFee,
          outsideDhakaFee,
          freeShippingMinAmount,
          updatedAt: new Date(),
        },
      });

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true, error: "" };
  } catch (err: any) {
    return { success: false, error: err.message || "সেটিংস আপডেট ব্যর্থ হয়েছে।" };
  }
}
