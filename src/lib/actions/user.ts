"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { productReviews, products, users } from "@/lib/db/schema";
import { uploadObject } from "@/lib/storage";

export async function submitReviewAction({
  productHandle,
  rating,
  comment,
}: {
  productHandle: string;
  rating: number;
  comment: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "রিভিউ দিতে অনুগ্রহ করে প্রথমে লগইন করুন।" };
    }

    if (!comment?.trim()) {
      return { success: false, error: "অনুগ্রহ করে আপনার মন্তব্য লিখুন।" };
    }

    const [product] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.handle, productHandle));

    if (!product) {
      return { success: false, error: "পণ্য পাওয়া যায়নি।" };
    }

    const [newReview] = await db
      .insert(productReviews)
      .values({
        id: crypto.randomUUID(),
        productId: product.id,
        userId: user.id,
        userName: user.name || "সম্মানিত ক্রেতা",
        userAvatar: user.avatarUrl,
        rating: Math.min(5, Math.max(1, rating)),
        comment: comment.trim(),
        approved: true,
      })
      .returning();

    revalidatePath(`/product/${productHandle}`);

    return {
      success: true,
      review: newReview,
      message: "আপনার রিভিউ সফলভাবে যুক্ত হয়েছে!",
    };
  } catch (err: unknown) {
    console.error("Submit review error:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "রিভিউ সংরক্ষণ করতে সমস্যা হয়েছে।",
    };
  }
}

export async function updateProfileUserAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "অনুগ্রহ করে প্রথমে লগইন করুন।" };
    }

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const avatarFile = formData.get("avatar") as File | null;

    let avatarUrl = user.avatarUrl;

    if (avatarFile && avatarFile.size > 0) {
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      const extension =
        avatarFile.name.endsWith(".webp") || avatarFile.type === "image/webp"
          ? "webp"
          : avatarFile.name.split(".").pop() || "webp";
      const s3Key = `avatars/${user.id}-${Date.now()}.${extension}`;
      avatarUrl = await uploadObject({
        key: s3Key,
        body: buffer,
        contentType: avatarFile.type || "image/webp",
      });
    }

    await db
      .update(users)
      .set({
        name: name || user.name,
        phone: phone || user.phone,
        avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");

    return { success: true, message: "প্রোফাইল সফলভাবে আপডেট হয়েছে।" };
  } catch (err: unknown) {
    console.error("Profile update error:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "প্রোফাইল আপডেট করতে সমস্যা হয়েছে।",
    };
  }
}
