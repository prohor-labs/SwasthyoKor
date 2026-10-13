"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../auth/session";
import { db } from "../db";
import { productReviews, users } from "../db/schema";

export async function submitReviewAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    const productId = formData.get("productId") as string;
    const rating = Math.min(
      5,
      Math.max(1, Number(formData.get("rating") || 5)),
    );
    const title = (formData.get("title") as string)?.trim() || "";
    const comment = (formData.get("comment") as string)?.trim() || "";
    const authorName =
      (formData.get("authorName") as string)?.trim() || user?.name || "গ্রাহক";

    if (!productId) {
      return { success: false, error: "পণ্য আইডি প্রয়োজন।" };
    }

    const id = crypto.randomUUID();
    const [review] = await db
      .insert(productReviews)
      .values({
        id,
        productId,
        userId: user?.id || null,
        rating,
        title,
        comment,
        authorName,
      })
      .returning();

    revalidatePath(`/product`);
    return { success: true, error: "", review };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "রিভিউ যোগ করতে সমস্যা হয়েছে।",
    };
  }
}

export async function updateProfileUserAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "অনুগ্রহ করে প্রথমে লগইন করুন।" };
    }

    const name = (formData.get("name") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();

    await db
      .update(users)
      .set({
        name: name || user.name,
        phone: phone || user.phone,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    revalidatePath("/dashboard/profile");
    return { success: true, message: "প্রোফাইল সফলভাবে আপডেট হয়েছে!", error: "" };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "প্রোফাইল আপডেট করতে সমস্যা হয়েছে।",
    };
  }
}
