import { type NextRequest, NextResponse } from "next/server";
import { addItemToCart } from "@/lib/db/cart";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { variantId, quantity = 1 } = body;

    if (!variantId) {
      return NextResponse.json(
        { error: "ভেরিয়েন্ট আইডি প্রয়োজন।" },
        { status: 400 },
      );
    }

    const cart = await addItemToCart(variantId, quantity);
    return NextResponse.json({ cart });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "কার্টে পণ্য যোগ করতে সমস্যা হয়েছে।";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
