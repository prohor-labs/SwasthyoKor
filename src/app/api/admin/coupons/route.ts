import { desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allCoupons = await db
    .select()
    .from(coupons)
    .orderBy(desc(coupons.createdAt));

  return NextResponse.json({ coupons: allCoupons });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      isActive,
    } = body;

    if (!code || !discountValue) {
      return NextResponse.json(
        { error: "কুপন কোড ও ডিসকাউন্ট ভ্যালু আবশ্যক।" },
        { status: 400 },
      );
    }

    const [created] = await db
      .insert(coupons)
      .values({
        code: code.trim().toUpperCase(),
        discountType: discountType || "percentage",
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        isActive: isActive !== false,
      })
      .returning();

    return NextResponse.json({ coupon: created }, { status: 201 });
  } catch (err: unknown) {
    console.error("Coupon create error:", err);
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "23505"
    ) {
      return NextResponse.json(
        { error: "এই নামের কুপন কোড ইতিমধ্যে বিদ্যমান।" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "সার্ভার এরর" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID আবশ্যক" }, { status: 400 });
    }

    await db.delete(coupons).where(eq(coupons.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Coupon delete error:", err);
    return NextResponse.json({ error: "সার্ভার এরর" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, isActive } = body;

    const [updated] = await db
      .update(coupons)
      .set({ isActive: Boolean(isActive) })
      .where(eq(coupons.id, id))
      .returning();

    return NextResponse.json({ coupon: updated });
  } catch (err) {
    console.error("Coupon update error:", err);
    return NextResponse.json({ error: "সার্ভার এরর" }, { status: 500 });
  }
}
