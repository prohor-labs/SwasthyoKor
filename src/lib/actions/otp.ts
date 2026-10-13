"use server";

import { and, desc, eq, gt } from "drizzle-orm";
import { getCurrentUser } from "../auth/session";
import { db } from "../db";
import { phoneVerificationTokens, users } from "../db/schema";
import { isValidBdPhone, normalizeBdPhone, sendBdBulkSms } from "../sms";

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

/**
 * Sends a 6-digit OTP code to the requested phone number
 */
export async function sendPhoneOtpAction(phoneInput: string) {
  const normalizedPhone = normalizeBdPhone(phoneInput);

  if (!isValidBdPhone(normalizedPhone)) {
    return {
      success: false,
      error: "সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)",
    };
  }

  // Rate limiting check: check if an OTP was sent in the last 45 seconds
  const recentToken = await db.query.phoneVerificationTokens.findFirst({
    where: and(
      eq(phoneVerificationTokens.phone, normalizedPhone),
      gt(phoneVerificationTokens.createdAt, new Date(Date.now() - 45 * 1000)),
    ),
    orderBy: [desc(phoneVerificationTokens.createdAt)],
  });

  if (recentToken) {
    return {
      success: false,
      error:
        "অল্প সময়ের মধ্যে একাধিকবার ওটিপি পাঠানো যাবে না। অনুগ্রহ করে একটু অপেক্ষা করুন।",
    };
  }

  // Generate 6-digit random numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Invalidate previous tokens for this phone
  await db
    .delete(phoneVerificationTokens)
    .where(eq(phoneVerificationTokens.phone, normalizedPhone));

  // Store new token in DB
  await db.insert(phoneVerificationTokens).values({
    phone: normalizedPhone,
    otp,
    expiresAt,
    attempts: 0,
  });

  // Dispatch SMS via BD Bulk SMS (or mock logger)
  const smsMessage = `আপনার স্বাস্থ্যকর অর্ডার ভেরিফিকেশন ওটিপি (OTP) হলো: ${otp}। কোডটি ৫ মিনিট কার্যকর থাকবে।`;
  const sendRes = await sendBdBulkSms(normalizedPhone, smsMessage);

  return {
    success: true,
    phone: normalizedPhone,
    mocked: sendRes.mocked,
    mockOtp: sendRes.mocked ? otp : undefined,
    message: sendRes.mocked
      ? `[মক মোড] ওটিপি কোড: ${otp}`
      : "আপনার মোবাইল নম্বরে ৬ ডিজিটের ওটিপি কোড পাঠানো হয়েছে।",
  };
}

/**
 * Verifies the OTP code entered by the user
 */
export async function verifyPhoneOtpAction(
  phoneInput: string,
  otpCode: string,
) {
  const normalizedPhone = normalizeBdPhone(phoneInput);
  const trimmedOtp = otpCode.trim();

  if (!trimmedOtp || trimmedOtp.length < 4) {
    return { success: false, error: "সঠিক ওটিপি কোড লিখুন।" };
  }

  const record = await db.query.phoneVerificationTokens.findFirst({
    where: and(
      eq(phoneVerificationTokens.phone, normalizedPhone),
      gt(phoneVerificationTokens.expiresAt, new Date()),
    ),
    orderBy: [desc(phoneVerificationTokens.createdAt)],
  });

  if (!record) {
    return {
      success: false,
      error: "ওটিপির মেয়াদ শেষ হয়ে গেছে বা পাওয়া যায়নি। পুনরায় ওটিপি পাঠান।",
    };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await db
      .delete(phoneVerificationTokens)
      .where(eq(phoneVerificationTokens.id, record.id));
    return {
      success: false,
      error: "ভুল ওটিপি দেওয়ার সর্বোচ্চ সীমা অতিক্রম করেছে। নতুন কোড পাঠান।",
    };
  }

  if (record.otp !== trimmedOtp) {
    await db
      .update(phoneVerificationTokens)
      .set({ attempts: record.attempts + 1 })
      .where(eq(phoneVerificationTokens.id, record.id));

    return {
      success: false,
      error: `ভুল ওটিপি কোড। বাকি চেষ্টা: ${MAX_ATTEMPTS - (record.attempts + 1)} বার`,
    };
  }

  // OTP is correct! Delete used token
  await db
    .delete(phoneVerificationTokens)
    .where(eq(phoneVerificationTokens.id, record.id));

  // If user is logged in, mark phone as verified and save phone number
  const currentUser = await getCurrentUser();
  if (currentUser) {
    await db
      .update(users)
      .set({
        phone: normalizedPhone,
        phoneVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, currentUser.id));
  }

  return {
    success: true,
    phone: normalizedPhone,
    message: "মোবাইল নম্বর সফলভাবে যাচাই হয়েছে!",
  };
}
