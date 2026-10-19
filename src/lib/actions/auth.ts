"use server";

import { randomBytes } from "node:crypto";
import { verify } from "@node-rs/argon2";
import { and, eq, lt } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSession, deleteCurrentSession } from "../auth/session";
import { db } from "../db";
import { accounts, magicLinkTokens, users } from "../db/schema";
import { sendMagicLinkEmail } from "../email";

export async function requestMagicLinkAction(formData: FormData) {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  if (!email?.includes("@")) {
    return { success: false, error: "একটি বৈধ ইমেইল ঠিকানা দিন।" };
  }

  try {
    // Clean up expired tokens for this email
    await db
      .delete(magicLinkTokens)
      .where(
        and(
          eq(magicLinkTokens.email, email),
          lt(magicLinkTokens.expiresAt, new Date()),
        ),
      );

    // Generate secure 32-byte token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    await db.insert(magicLinkTokens).values({
      email,
      token,
      expiresAt,
    });

    const headersList = await headers();
    const host = headersList.get("host") || "swasthyokor.com";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    const magicLinkUrl = `${baseUrl}/api/auth/verify-magic-link?token=${token}`;

    const { error } = await sendMagicLinkEmail({
      to: email,
      magicLinkUrl,
    });

    if (error) {
      console.error("[Resend Error]:", error);
      return {
        success: false,
        error: "ইমেইল পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
      };
    }

    return {
      success: true,
      message:
        "আপনার ইমেইলে ম্যাজিক লিংক পাঠানো হয়েছে! অনুগ্রহ করে ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।",
    };
  } catch (err) {
    console.error("[Magic Link Error]:", err);
    return {
      success: false,
      error: "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।",
    };
  }
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
