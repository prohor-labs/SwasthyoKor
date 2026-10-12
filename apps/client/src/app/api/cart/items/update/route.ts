import { type NextRequest, NextResponse } from "next/server";
import { updateItemQuantityInCart } from "@/lib/db/cart";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { variantId, type } = body;

    if (!variantId || !type) {
      return NextResponse.json(
        { error: "ভেরিয়েন্ট আইডি এবং আপডেটের ধরন প্রয়োজন।" },
        { status: 400 },
      );
    }

    const cart = await updateItemQuantityInCart(variantId, type);
    return NextResponse.json({ cart });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "কার্ট আপডেট করতে সমস্যা হয়েছে।" },
      { status: 500 },
    );
  }
}
