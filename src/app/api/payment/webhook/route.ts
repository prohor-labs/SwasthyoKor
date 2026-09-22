import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { validateWebhookHeader } from "@/lib/uddoktapay";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("rt-uddoktapay-api-key");

    if (!validateWebhookHeader(authHeader)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();

    const {
      invoice_id,
      transaction_id,
      sender_number,
      payment_method,
      amount,
      status,
      metadata,
    } = payload;

    const orderId = metadata?.order_id;

    if (orderId && status === "COMPLETED") {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId));

      if (order) {
        // Strict verification: Verify amount in webhook matches database order total
        const paidAmount = parseFloat(amount || "0");
        const expectedAmount = Number(order.totalAmount);

        if (Math.abs(paidAmount - expectedAmount) < 0.5) {
          await db
            .update(orders)
            .set({
              paymentStatus: "paid",
              status: "confirmed",
              paymentTrxId: transaction_id || null,
              paymentSenderNumber: sender_number || null,
              paymentMethod: payment_method || "online",
              paymentInvoiceId: invoice_id || null,
              updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId));

          if (order.couponCode && order.paymentStatus !== "paid") {
            const { coupons } = await import("@/lib/db/schema");
            const { sql } = await import("drizzle-orm");
            await db
              .update(coupons)
              .set({ usedCount: sql`${coupons.usedCount} + 1` })
              .where(eq(coupons.code, order.couponCode));
          }
        } else {
          console.error(
            `Webhook amount mismatch for order ${orderId}: Expected ${expectedAmount}, received ${paidAmount}`,
          );
        }
      }
    }

    return NextResponse.json(
      { message: "Webhook processed successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("UddoktaPay Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
