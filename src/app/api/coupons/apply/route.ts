import { and, eq, gt, isNull, or } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { code, orderAmount } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "কুপন কোড প্রদান করুন।" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const amount = Number(orderAmount) || 0;

    const [coupon] = await db
      .select()
      .from(coupons)
      .where(
        and(
          eq(coupons.code, cleanCode),
          eq(coupons.isActive, true),
          or(isNull(coupons.expiresAt), gt(coupons.expiresAt, new Date())),
        ),
      )
      .limit(1);

    if (!coupon) {
      return NextResponse.json(
        { error: "কুপন কোডটি সঠিক নয় অথবা মেয়াদ শেষ হয়ে গেছে।" },
        { status: 400 },
      );
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: "এই কুপন ব্যবহারের সর্বোচ্চ সীমা শেষ হয়ে গেছে।" },
        { status: 400 },
      );
    }

    if (amount < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          error: `এই কুপনটি ব্যবহার করতে সর্বনিম্ন ৳${coupon.minOrderAmount} টাকার অর্ডার প্রয়োজন।`,
        },
        { status: 400 },
      );
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }

    // Ensure discount does not exceed total order amount
    discount = Math.min(discount, amount);
    const finalAmount = Math.max(0, amount - discount);

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: discount,
      finalAmount,
      message: `কুপন সফলভাবে যুক্ত হয়েছে! ৳${discount.toFixed(0)} ছাড় পেয়েছেন।`,
    });
  } catch (err) {
    console.error("Apply coupon error:", err);
    return NextResponse.json(
      { error: "কুপন যাচাই করতে সমস্যা হয়েছে।" },
      { status: 500 },
    );
  }
}
