"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  blogs,
  collections,
  heroBanners,
  orders,
  productCollections,
  productImages,
  productOptions,
  products,
  productVariants,
} from "@/lib/db/schema";
import { uploadObject } from "@/lib/storage";

import { PRODUCT_UNITS, type ProductUnit } from "@/lib/types";

// ─── Products ─────────────────────────────────────────────────────────────

interface VariantPayload {
  id?: string;
  title: string;
  price: string | number;
  compareAtPrice?: string | number | null;
  inventoryQuantity: number;
  unit?: ProductUnit;
}

export async function createProductAction(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const handle = (formData.get("handle") as string)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");
    const description = (formData.get("description") as string) || "";
    const categoryId = formData.get("collectionId") as string;
    const imageFile = formData.get("image") as File | null;
    const imageUrlInput = formData.get("imageUrl") as string;

    const id = `prod_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date();

    let finalImageUrl = imageUrlInput || "";
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const extension =
        imageFile.name.endsWith(".webp") || imageFile.type === "image/webp"
          ? "webp"
          : imageFile.name.split(".").pop() || "webp";
      const s3Key = `products/${id}-${Date.now()}.${extension}`;
      finalImageUrl = await uploadObject({
        key: s3Key,
        body: buffer,
        contentType: imageFile.type || "image/webp",
      });
    }

    if (!finalImageUrl) {
      finalImageUrl =
        "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800";
    }

    const variantsRaw = formData.get("variants") as string | null;
    let variantsList: VariantPayload[] = [];

    if (variantsRaw) {
      try {
        variantsList = JSON.parse(variantsRaw);
      } catch (e) {
        console.error("Failed to parse variants json:", e);
      }
    }

    if (!variantsList || variantsList.length === 0) {
      const priceAmount = Number(formData.get("price") || 0);
      const compareAtPriceInput = formData.get("compareAtPrice") as string;
      const compareAtPrice = compareAtPriceInput ? Number(compareAtPriceInput) : null;
      const inventoryQuantity = Math.max(
        0,
        parseInt((formData.get("inventoryQuantity") as string) || "15", 10),
      );
      const rawUnit = (formData.get("unit") as string)?.trim();
      const unit: ProductUnit =
        rawUnit && PRODUCT_UNITS.includes(rawUnit as ProductUnit)
          ? (rawUnit as ProductUnit)
          : "packet";

      variantsList = [
        {
          title: "স্ট্যান্ডার্ড প্যাক",
          price: priceAmount,
          compareAtPrice,
          inventoryQuantity,
          unit,
        },
      ];
    }

    const totalInventory = variantsList.reduce(
      (acc, v) => acc + (Number(v.inventoryQuantity) || 0),
      0,
    );

    await db.insert(products).values({
      id,
      handle,
      title,
      description,
      descriptionHtml: description
        ? `<p>${description.replace(/\r\n/g, "\n").replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`
        : null,
      availableForSale: totalInventory > 0,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(productImages).values({
      id: `img_${crypto.randomUUID().slice(0, 8)}`,
      productId: id,
      url: finalImageUrl,
      altText: title,
      width: 800,
      height: 800,
      position: 0,
    });
      const variantTitles = variantsList.map(
        (v, idx) => v.title?.trim() || `প্যাক ${idx + 1}`,
      );
      await db.insert(productOptions).values({
        id: `opt_${crypto.randomUUID().slice(0, 8)}`,
        productId: id,
        name: "পরিমাণ",
        position: 0,
        values: variantTitles,
      });

      for (let i = 0; i < variantsList.length; i++) {
        const v = variantsList[i];
        const vTitle = v.title?.trim() || `প্যাক ${i + 1}`;
        const vPrice = Number(v.price || 0);
        const vComparePrice = v.compareAtPrice ? Number(v.compareAtPrice) : null;
        const vQty = Math.max(0, Number(v.inventoryQuantity) || 0);
        const vUnit: ProductUnit =
          v.unit && PRODUCT_UNITS.includes(v.unit as ProductUnit)
            ? (v.unit as ProductUnit)
            : "packet";

        await db.insert(productVariants).values({
          id: `var_${crypto.randomUUID().slice(0, 8)}`,
          productId: id,
          title: vTitle,
          priceAmount: vPrice,
          compareAtPrice: vComparePrice,
          priceCurrency: "BDT",
          availableForSale: vQty > 0,
          inventoryQuantity: vQty,
          unit: vUnit,
          position: i,
          selectedOptions: [{ name: "পরিমাণ", value: vTitle }],
        });
      }

      if (categoryId) {
        await db.insert(productCollections).values({
          productId: id,
          collectionId: categoryId,
        });
      }

      revalidatePath("/admin/products");
      revalidatePath("/search");
      revalidatePath("/");

      return { success: true, message: "পণ্য সফলভাবে তৈরি করা হয়েছে।" };
  } catch (err: unknown) {
    console.error("Create product error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "পণ্য তৈরি করতে সমস্যা হয়েছে।",
    };
  }
}


export async function updateProductAction(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    if (!id) {
      return { success: false, error: "পণ্যের আইডি পাওয়া যায়নি।" };
    }

    const title = formData.get("title") as string;
    const handle = (formData.get("handle") as string)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");
    const description = (formData.get("description") as string) || "";
    const categoryId = formData.get("collectionId") as string;
    const imageFile = formData.get("image") as File | null;
    const imageUrlInput = formData.get("imageUrl") as string;

    const now = new Date();

    const variantsRaw = formData.get("variants") as string | null;
    let variantsList: VariantPayload[] = [];

    if (variantsRaw) {
      try {
        variantsList = JSON.parse(variantsRaw);
      } catch (e) {
        console.error("Failed to parse variants json:", e);
      }
    }

    if (variantsList && variantsList.length > 0) {
      const totalInventory = variantsList.reduce(
        (acc, v) => acc + (Number(v.inventoryQuantity) || 0),
        0,
      );
      const isManualOutOfStock = formData.get("availableForSale") === "false";
      const availableForSale = !isManualOutOfStock && totalInventory > 0;

      const descriptionHtml = description
        ? `<p>${description.replace(/\r\n/g, "\n").replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`
        : null;

      await db
        .update(products)
        .set({
          title,
          handle,
          description,
          descriptionHtml,
          availableForSale,
          updatedAt: now,
        })
        .where(eq(products.id, id));

      const existingVariants = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, id));

      const existingIds = new Set(existingVariants.map((v) => v.id));
      const submittedIds = new Set(variantsList.map((v) => v.id).filter(Boolean) as string[]);

      for (const existing of existingVariants) {
        if (!submittedIds.has(existing.id)) {
          await db.delete(productVariants).where(eq(productVariants.id, existing.id));
        }
      }

      for (let i = 0; i < variantsList.length; i++) {
        const v = variantsList[i];
        const vTitle = v.title?.trim() || `প্যাক ${i + 1}`;
        const vPrice = Number(v.price || 0);
        const vComparePrice = v.compareAtPrice ? Number(v.compareAtPrice) : null;
        const vQty = Math.max(0, Number(v.inventoryQuantity) || 0);
        const vUnit: ProductUnit =
          v.unit && PRODUCT_UNITS.includes(v.unit as ProductUnit)
            ? (v.unit as ProductUnit)
            : "packet";
        const vAvailable = !isManualOutOfStock && vQty > 0;

        if (v.id && existingIds.has(v.id)) {
          await db
            .update(productVariants)
            .set({ title: vTitle, priceAmount: vPrice, compareAtPrice: vComparePrice, priceCurrency: "BDT", availableForSale: vAvailable, inventoryQuantity: vQty, unit: vUnit, position: i, selectedOptions: [{ name: "পরিমাণ", value: vTitle }] })
            .where(eq(productVariants.id, v.id));
        } else {
          await db.insert(productVariants).values({
            id: v.id || `var_${crypto.randomUUID().slice(0, 8)}`,
            productId: id,
            title: vTitle,
            priceAmount: vPrice,
            compareAtPrice: vComparePrice,
            priceCurrency: "BDT",
            availableForSale: vAvailable,
            inventoryQuantity: vQty,
            unit: vUnit,
            position: i,
            selectedOptions: [{ name: "পরিমাণ", value: vTitle }],
          });
        }
      }

      const variantTitles = variantsList.map((v, idx) => v.title?.trim() || `প্যাক ${idx + 1}`);
      const existingOptions = await db.select().from(productOptions).where(eq(productOptions.productId, id));

      if (existingOptions.length > 0) {
        await db.update(productOptions).set({ name: "পরিমাণ", values: variantTitles }).where(eq(productOptions.id, existingOptions[0].id));
      } else {
        await db.insert(productOptions).values({ id: `opt_${crypto.randomUUID().slice(0, 8)}`, productId: id, name: "পরিমাণ", position: 0, values: variantTitles });
      }
    } else {
      // Single variant fallback
      const priceAmount = Number(formData.get("price") || 0);
      const compareAtPrice = formData.get("compareAtPrice") ? Number(formData.get("compareAtPrice")) : null;
      const inventoryQuantity = Math.max(0, parseInt((formData.get("inventoryQuantity") as string) || "0", 10));
      const availableForSale = inventoryQuantity > 0;

      const descriptionHtml = description
        ? `<p>${description.replace(/\r\n/g, "\n").replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`
        : null;

      await db
        .update(products)
        .set({
          title,
          handle,
          description,
          descriptionHtml,
          availableForSale,
          updatedAt: now,
        })
        .where(eq(products.id, id));

      const existingVariants = await db.select().from(productVariants).where(eq(productVariants.productId, id));
      if (existingVariants.length > 0) {
        await db.update(productVariants)
          .set({ priceAmount, compareAtPrice, availableForSale, inventoryQuantity })
          .where(eq(productVariants.productId, id));
      }
    }

    // Update image
    let finalImageUrl = imageUrlInput || "";
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const extension = imageFile.name.endsWith(".webp") || imageFile.type === "image/webp" ? "webp" : imageFile.name.split(".").pop() || "webp";
      finalImageUrl = await uploadObject({ key: `products/${id}-${Date.now()}.${extension}`, body: buffer, contentType: imageFile.type || "image/webp" });
    }

    if (finalImageUrl) {
      const existingImages = await db.select().from(productImages).where(eq(productImages.productId, id));
      if (existingImages.length > 0) {
        await db.update(productImages).set({ url: finalImageUrl, altText: title }).where(eq(productImages.productId, id));
      } else {
        await db.insert(productImages).values({ id: `img_${crypto.randomUUID().slice(0, 8)}`, productId: id, url: finalImageUrl, altText: title, width: 800, height: 800, position: 0 });
      }
    }

    // Update collection
    if (categoryId) {
      const existingProdCol = await db.select().from(productCollections).where(eq(productCollections.productId, id));
      if (existingProdCol.length > 0) {
        await db.update(productCollections).set({ collectionId: categoryId }).where(eq(productCollections.productId, id));
      } else {
        await db.insert(productCollections).values({ productId: id, collectionId: categoryId });
      }
    }

    revalidatePath("/admin/products");
    revalidatePath("/search");
    revalidatePath(`/product/${handle}`);
    revalidatePath("/");

    return { success: true, message: "পণ্য সফলভাবে আপডেট করা হয়েছে।" };
  } catch (err: unknown) {
    console.error("Update product error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "পণ্য আপডেট করতে সমস্যা হয়েছে।",
    };
  }
}



export async function toggleProductAvailabilityAction(
  productId: string,
  availableForSale: boolean,
) {
  try {
    const { sql } = await import("drizzle-orm");

    await db
      .update(products)
      .set({
        availableForSale,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));

    if (availableForSale) {
      await db
        .update(productVariants)
        .set({
          availableForSale: true,
          inventoryQuantity: sql`CASE WHEN ${productVariants.inventoryQuantity} <= 0 THEN 15 ELSE ${productVariants.inventoryQuantity} END`,
        })
        .where(eq(productVariants.productId, productId));
    } else {
      await db
        .update(productVariants)
        .set({
          availableForSale: false,
          inventoryQuantity: 0,
        })
        .where(eq(productVariants.productId, productId));
    }

    revalidatePath("/admin/products");
    revalidatePath("/search");
    revalidatePath("/");

    return { success: true };
  } catch (err) {
    console.error("Toggle product availability error:", err);
    return {
      success: false,
      error: "স্টক স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে।",
    };
  }
}


export async function deleteProductAction(productId: string) {
  try {
    await db.delete(products).where(eq(products.id, productId));
    revalidatePath("/admin/products");
    revalidatePath("/search");
    revalidatePath("/");
    return { success: true, message: "পণ্য মুছে ফেলা হয়েছে।" };
  } catch (err: unknown) {
    console.error("Delete product error:", err);
    return { success: false, error: "পণ্য মুছতে সমস্যা হয়েছে।" };
  }
}

// ─── Orders ───────────────────────────────────────────────────────────────

export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    await db.update(orders).set({ status }).where(eq(orders.id, orderId));
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true, message: "অর্ডার স্ট্যাটাস আপডেট হয়েছে।" };
  } catch (err: unknown) {
    console.error("Update order status error:", err);
    return { success: false, error: "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।" };
  }
}

// ─── Collections ──────────────────────────────────────────────────────────

export async function createCollectionAction(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const handle = (formData.get("handle") as string)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");
    const description = (formData.get("description") as string) || "";
    const subtitle = (formData.get("subtitle") as string) || "";
    const image = (formData.get("image") as string)?.trim() || null;
    const showOnHomepage = formData.get("showOnHomepage") === "true" || formData.get("showOnHomepage") === "on";
    const displayOrder = parseInt((formData.get("displayOrder") as string) || "0", 10) || 0;
    const maxProducts = parseInt((formData.get("maxProducts") as string) || "4", 10) || 4;

    const id = `col_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date();

    await db.insert(collections).values({
      id,
      handle,
      title,
      description,
      subtitle,
      image,
      showOnHomepage,
      displayOrder,
      maxProducts,
      createdAt: now,
      updatedAt: now,
    });

    revalidatePath("/admin/collections");
    revalidatePath("/search");
    revalidatePath("/category");
    revalidatePath("/");

    return { success: true, message: "কালেকশন তৈরি হয়েছে।" };
  } catch (err: unknown) {
    console.error("Create collection error:", err);
    return { success: false, error: "কালেকশন তৈরিতে ত্রুটি।" };
  }
}

export async function updateCollectionAction(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    if (!id) return { success: false, error: "কালেকশন আইডি পাওয়া যায়নি।" };

    const title = formData.get("title") as string;
    const handle = (formData.get("handle") as string)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");
    const description = (formData.get("description") as string) || "";
    const subtitle = (formData.get("subtitle") as string) || "";
    const image = (formData.get("image") as string)?.trim() || null;
    const showOnHomepage = formData.get("showOnHomepage") === "true" || formData.get("showOnHomepage") === "on";
    const displayOrder = parseInt((formData.get("displayOrder") as string) || "0", 10) || 0;
    const maxProducts = parseInt((formData.get("maxProducts") as string) || "4", 10) || 4;

    const now = new Date();

    await db
      .update(collections)
      .set({
        title,
        handle,
        description,
        subtitle,
        image,
        showOnHomepage,
        displayOrder,
        maxProducts,
        updatedAt: now,
      })
      .where(eq(collections.id, id));

    revalidatePath("/admin/collections");
    revalidatePath("/search");
    revalidatePath("/category");
    revalidatePath("/");

    return { success: true, message: "কালেকশন সফলভাবে আপডেট করা হয়েছে।" };
  } catch (err: unknown) {
    console.error("Update collection error:", err);
    return { success: false, error: "কালেকশন আপডেট করতে সমস্যা হয়েছে।" };
  }
}

export async function toggleCollectionHomepageAction(
  id: string,
  showOnHomepage: boolean,
) {
  try {
    await db
      .update(collections)
      .set({
        showOnHomepage,
        updatedAt: new Date(),
      })
      .where(eq(collections.id, id));

    revalidatePath("/admin/collections");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    console.error("Toggle collection homepage error:", err);
    return { success: false, error: "স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে।" };
  }
}

export async function deleteCollectionAction(collectionId: string) {
  try {
    await db.delete(collections).where(eq(collections.id, collectionId));
    revalidatePath("/admin/collections");
    revalidatePath("/search");
    revalidatePath("/category");
    revalidatePath("/");
    return { success: true, message: "কালেকশন মুছে ফেলা হয়েছে।" };
  } catch (err: unknown) {
    console.error("Delete collection error:", err);
    return { success: false, error: "কালেকশন মুছতে সমস্যা হয়েছে।" };
  }
}

// ─── Blogs ────────────────────────────────────────────────────────────────

export async function createBlogAction(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const slug = (formData.get("slug") as string)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, "-");
    const description = (formData.get("description") as string) || "";
    const content = (formData.get("content") as string) || "";
    const category = (formData.get("category") as string) || "মধু ও পুষ্টি";
    const readTime = (formData.get("readTime") as string) || "৫ মিনিট";
    const author = (formData.get("author") as string) || "স্বাস্থ্যকর নিউট্রিশন টিম";
    const coverImage =
      (formData.get("coverImage") as string) ||
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=85";

    const id = `blog_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date();

    await db.insert(blogs).values({
      id,
      slug,
      title,
      description,
      content,
      category,
      readTime,
      author,
      coverImage,
      tags: ["অর্গানিক ফুড", "স্বাস্থ্য টিপস"],
      relatedProductHandles: [],
      published: true,
      createdAt: now,
      updatedAt: now,
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);

    return { success: true, message: "ব্লগ আর্টিকেল সফলভাবে তৈরি হয়েছে।" };
  } catch (err: unknown) {
    console.error("Create blog error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "ব্লগ তৈরি করতে সমস্যা হয়েছে।",
    };
  }
}

export async function updateBlogAction(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    if (!id) return { success: false, error: "ব্লগ আইডি পাওয়া যায়নি।" };

    const title = formData.get("title") as string;
    const slug = (formData.get("slug") as string)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, "-");
    const description = (formData.get("description") as string) || "";
    const content = (formData.get("content") as string) || "";
    const category = (formData.get("category") as string) || "মধু ও পুষ্টি";
    const readTime = (formData.get("readTime") as string) || "৫ মিনিট";
    const author = (formData.get("author") as string) || "স্বাস্থ্যকর নিউট্রিশন টিম";
    const coverImage = (formData.get("coverImage") as string) || "";

    const now = new Date();

    await db
      .update(blogs)
      .set({
        title,
        slug,
        description,
        content,
        category,
        readTime,
        author,
        ...(coverImage ? { coverImage } : {}),
        updatedAt: now,
      })
      .where(eq(blogs.id, id));

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);

    return { success: true, message: "ব্লগ আর্টিকেল সফলভাবে আপডেট হয়েছে।" };
  } catch (err: unknown) {
    console.error("Update blog error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "ব্লগ আপডেট করতে সমস্যা হয়েছে।",
    };
  }
}

export async function deleteBlogAction(blogId: string) {
  try {
    await db.delete(blogs).where(eq(blogs.id, blogId));
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return { success: true, message: "ব্লগ আর্টিকেল মুছে ফেলা হয়েছে।" };
  } catch (err: unknown) {
    console.error("Delete blog error:", err);
    return { success: false, error: "ব্লগ মুছতে সমস্যা হয়েছে।" };
  }
}

// ─── Hero Banners ─────────────────────────────────────────────────────────

export async function createHeroBannerAction(formData: FormData) {
  try {
    const title = (formData.get("title") as string) || "";
    const highlight = (formData.get("highlight") as string) || "";
    const subtitle = (formData.get("subtitle") as string) || "";
    const link = (formData.get("link") as string) || "/search";
    const accentColor =
      (formData.get("accentColor") as string) || "text-amber-400";
    const position = Number(formData.get("position") || 0);
    const imageFile = formData.get("image") as File | null;
    const imageUrlInput = (formData.get("imageUrl") as string) || "";

    let finalImageUrl = imageUrlInput;

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const extension =
        imageFile.name.endsWith(".webp") || imageFile.type === "image/webp"
          ? "webp"
          : imageFile.name.split(".").pop() || "webp";
      const s3Key = `banners/banner-${Date.now()}.${extension}`;
      finalImageUrl = await uploadObject({
        key: s3Key,
        body: buffer,
        contentType: imageFile.type || "image/webp",
      });
    }

    if (!finalImageUrl) {
      return { success: false, error: "অনুগ্রহ করে ব্যানারের ছবি দিন।" };
    }

    await db.insert(heroBanners).values({
      id: `banner_${crypto.randomUUID().slice(0, 8)}`,
      title,
      highlight,
      subtitle,
      link,
      accentColor,
      image: finalImageUrl,
      position,
      active: true,
      createdAt: new Date(),
    });

    revalidatePath("/admin/banners");
    revalidatePath("/");

    return { success: true, message: "হিরো ব্যানার সফলভাবে তৈরি করা হয়েছে।" };
  } catch (err: unknown) {
    console.error("Create banner error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "ব্যানার তৈরি করতে সমস্যা হয়েছে।",
    };
  }
}

export async function updateHeroBannerAction(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    if (!id) return { success: false, error: "ব্যানার আইডি পাওয়া যায়নি।" };

    const title = (formData.get("title") as string) || "";
    const highlight = (formData.get("highlight") as string) || "";
    const subtitle = (formData.get("subtitle") as string) || "";
    const link = (formData.get("link") as string) || "/search";
    const accentColor =
      (formData.get("accentColor") as string) || "text-amber-400";
    const position = Number(formData.get("position") || 0);
    const active = formData.get("active") === "true";
    const imageFile = formData.get("image") as File | null;
    const imageUrlInput = (formData.get("imageUrl") as string) || "";

    let finalImageUrl = imageUrlInput;

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const extension =
        imageFile.name.endsWith(".webp") || imageFile.type === "image/webp"
          ? "webp"
          : imageFile.name.split(".").pop() || "webp";
      const s3Key = `banners/banner-${Date.now()}.${extension}`;
      finalImageUrl = await uploadObject({
        key: s3Key,
        body: buffer,
        contentType: imageFile.type || "image/webp",
      });
    }

    await db
      .update(heroBanners)
      .set({
        title,
        highlight,
        subtitle,
        link,
        accentColor,
        position,
        active,
        ...(finalImageUrl ? { image: finalImageUrl } : {}),
      })
      .where(eq(heroBanners.id, id));

    revalidatePath("/admin/banners");
    revalidatePath("/");

    return { success: true, message: "হিরো ব্যানার আপডেট করা হয়েছে।" };
  } catch (err: unknown) {
    console.error("Update banner error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "ব্যানার আপডেট করতে সমস্যা হয়েছে।",
    };
  }
}

export async function deleteHeroBannerAction(id: string) {
  try {
    await db.delete(heroBanners).where(eq(heroBanners.id, id));
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true, message: "হিরো ব্যানার মুছে ফেলা হয়েছে।" };
  } catch (err: unknown) {
    console.error("Delete banner error:", err);
    return { success: false, error: "ব্যানার মুছতে সমস্যা হয়েছে।" };
  }
}
