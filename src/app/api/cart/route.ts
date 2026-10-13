import { NextResponse } from "next/server";
import { getCart } from "@/lib/db/cart";

export async function GET() {
  try {
    const cart = await getCart();
    return NextResponse.json({ cart });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "কার্ট লোড করতে সমস্যা হয়েছে";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
