import { NextResponse } from "next/server";
import { getCart } from "@/lib/db/cart";

export async function GET() {
  try {
    const cart = await getCart();
    return NextResponse.json({ cart });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "কার্ট লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
