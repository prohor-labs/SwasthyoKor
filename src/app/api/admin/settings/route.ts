import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { storeSettings } from "@/lib/db/schema";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let [settings] = await db
    .select()
    .from(storeSettings)
    .where(eq(storeSettings.id, "default"));

  if (!settings) {
    [settings] = await db
      .insert(storeSettings)
      .values({
        id: "default",
        storeName: "স্বাস্থ্যকর",
        storePhone: "01812345678",
        whatsappNumber: "8801812345678",
        storeEmail: "support@swasthyokor.com",
        storeAddress: "ঢাকা, বাংলাদেশ",
        insideDhakaFee: 60,
        outsideDhakaFee: 120,
        freeShippingMinAmount: 1500,
      })
      .returning();
  }

  return NextResponse.json({ settings });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      storeName,
      storePhone,
      whatsappNumber,
      storeEmail,
      storeAddress,
      insideDhakaFee,
      outsideDhakaFee,
      freeShippingMinAmount,
    } = body;

    const [updated] = await db
      .insert(storeSettings)
      .values({
        id: "default",
        storeName,
        storePhone,
        whatsappNumber,
        storeEmail,
        storeAddress,
        insideDhakaFee: Number(insideDhakaFee) || 60,
        outsideDhakaFee: Number(outsideDhakaFee) || 120,
        freeShippingMinAmount: Number(freeShippingMinAmount) || 1500,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: storeSettings.id,
        set: {
          storeName,
          storePhone,
          whatsappNumber,
          storeEmail,
          storeAddress,
          insideDhakaFee: Number(insideDhakaFee) || 60,
          outsideDhakaFee: Number(outsideDhakaFee) || 120,
          freeShippingMinAmount: Number(freeShippingMinAmount) || 1500,
          updatedAt: new Date(),
        },
      })
      .returning();

    return NextResponse.json({ settings: updated, success: true });
  } catch (err) {
    console.error("Store settings update error:", err);
    return NextResponse.json({ error: "সার্ভার এরর" }, { status: 500 });
  }
}
