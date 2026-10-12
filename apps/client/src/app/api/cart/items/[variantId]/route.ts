import { type NextRequest, NextResponse } from "next/server";
import { updateItemQuantityInCart } from "@/lib/db/cart";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ variantId: string }> },
) {
  try {
    const { variantId } = await params;
    const body = await req.json();
    const { type } = body;

    const cart = await updateItemQuantityInCart(variantId, type);
    return NextResponse.json({ cart });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "কার্ট আপডেট করতে সমস্যা হয়েছে।" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ variantId: string }> },
) {
  try {
    const { variantId } = await params;
    const cart = await updateItemQuantityInCart(variantId, "delete");
    return NextResponse.json({ cart });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "পণ্যটি কার্ট থেকে সরাতে সমস্যা হয়েছে।" },
      { status: 500 },
    );
  }
}
