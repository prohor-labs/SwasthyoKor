import { and, eq, gt, isNull, or } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { code, orderAmount } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "কুপন কোড প্রদান করুন।" },
        { status: 400 },
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const rawSubtotal = Number(orderAmount) || 0;

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
        { error: "কুপন কোডটি সঠিক নয় বা এর মেয়াদ শেষ হয়ে গেছে।" },
        { status: 400 },
      );
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: "এই কুপনের ব্যবহারের সীমা শেষ হয়ে গেছে।" },
        { status: 400 },
      );
    }

    if (rawSubtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          error: `এই কুপনটি ব্যবহার করতে সর্বনিম্ন ৳${coupon.minOrderAmount.toLocaleString(
            "bn-BD",
          )} এর অর্ডার করতে হবে।`,
        },
        { status: 400 },
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (rawSubtotal * coupon.discountValue) / 100;
      if (
        coupon.maxDiscountAmount &&
        discountAmount > coupon.maxDiscountAmount
      ) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, rawSubtotal);
    const finalAmount = Math.max(1, rawSubtotal - discountAmount);

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discountAmount,
      finalAmount,
      message: "কুপন সফলভাবে যুক্ত হয়েছে!",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "কুপন যাচাই করতে সমস্যা হয়েছে।" },
      { status: 500 },
    );
  }
}
