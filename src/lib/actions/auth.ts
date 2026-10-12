"use server";

import { verify } from "@node-rs/argon2";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { createSession, deleteCurrentSession } from "../auth/session";
import { db } from "../db";
import { accounts, users } from "../db/schema";

export async function requestMagicLinkAction(formData: FormData) {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  if (!email?.includes("@")) {
    return { success: false, error: "একটি বৈধ ইমেইল ঠিকানা দিন।" };
  }
  // For demo/development magic link auto-login or placeholder
  return {
    success: true,
    message: "ম্যাজিক লিংক পাঠানো হয়েছে! অনুগ্রহ করে আপনার ইনবক্স চেক করুন।",
  };
}

export async function loginWithPasswordAction(formData: FormData) {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "ইমেইল এবং পাসওয়ার্ড আবশ্যক।" };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return { success: false, error: "ভুল ইমেইল অথবা পাসওয়ার্ড।" };
  }

  if (user.isBanned) {
    return { success: false, error: "আপনার অ্যাকাউন্ট স্থগিত করা হয়েছে।" };
  }

  const account = await db.query.accounts.findFirst({
    where: and(eq(accounts.userId, user.id), eq(accounts.provider, "email")),
  });

  if (!account?.passwordHash) {
    return {
      success: false,
      error: "এই অ্যাকাউন্টের জন্য কোনো পাসওয়ার্ড সেট করা নেই।",
    };
  }

  const isValid = await verify(account.passwordHash, password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  if (!isValid) {
    return { success: false, error: "ভুল ইমেইল অথবা পাসওয়ার্ড।" };
  }

  await createSession(user.id);
  return { success: true };
}

export async function logoutAction() {
  await deleteCurrentSession();
  redirect("/login");
}
