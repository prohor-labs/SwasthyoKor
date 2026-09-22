"use server";

import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { deleteSession, getCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { magicLinkTokens } from "@/lib/db/schema";
import { sendMagicLinkEmail } from "@/lib/email";

async function _getRequestMeta() {
  const headersList = await headers();
  const rawIp =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    undefined;
  const ip = rawIp ? rawIp.replace(/^::ffff:/, "") : undefined;
  return {
    ip,
    userAgent: headersList.get("user-agent") ?? undefined,
  };
}

export async function requestMagicLinkAction(formData: FormData) {
  const currentSession = await getCurrentSession();
  if (currentSession) redirect("/dashboard");

  const email = (formData.get("email") as string)?.toLowerCase().trim();
  if (!email?.includes("@")) {
    return { success: false, error: "একটি বৈধ ইমেইল ঠিকানা দিন।" };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Delete previous tokens for this email
  await db.delete(magicLinkTokens).where(eq(magicLinkTokens.email, email));
  await db.insert(magicLinkTokens).values({ email, token, expiresAt });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const result = await sendMagicLinkEmail({
    to: email,
    token,
    appUrl,
  });

  if (!result.success) {
    await db.delete(magicLinkTokens).where(eq(magicLinkTokens.token, token));
    return { success: false, error: result.error || "ইমেইল পাঠাতে সমস্যা হয়েছে।" };
  }

  return {
    success: true,
    message: "ম্যাজিক লিংক পাঠানো হয়েছে! আপনার ইমেইল ইনবক্স চেক করুন।",
  };
}

import { verify } from "@node-rs/argon2";
import { and } from "drizzle-orm";
import { createSession } from "@/lib/auth/session";
import { accounts, users } from "@/lib/db/schema";

export async function loginWithPasswordAction(formData: FormData) {
  const currentSession = await getCurrentSession();
  if (currentSession) redirect("/dashboard");

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
      error: "এই অ্যাকাউন্টের জন্য কোনো পাসওয়ার্ড সেট করা নেই। ম্যাজিক লিংক ব্যবহার করুন।",
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

  const meta = await _getRequestMeta();
  await createSession(user.id, meta);

  return { success: true };
}

async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
