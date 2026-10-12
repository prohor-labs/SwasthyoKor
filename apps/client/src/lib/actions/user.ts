"use server";

export async function submitReviewAction(formData: FormData) {
  return { success: true, error: "", review: {} };
}

export async function updateProfileUserAction(formData: FormData) {
  return { success: true, message: "আপডেট সফল হয়েছে", error: "" };
}
