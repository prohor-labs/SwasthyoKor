import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { verifyPayment } from "@/lib/uddoktapay";

export const metadata = {
  title: "পেমেন্ট যাচাইকরণ | স্বাস্থ্যকর",
  description: "আপনার পেমেন্ট যাচাই করা হচ্ছে...",
};

interface CallbackProps {
  searchParams: Promise<{
    invoice_id?: string;
    order_id?: string;
  }>;
}

export default async function PaymentCallbackPage({
  searchParams,
}: CallbackProps) {
  const { invoice_id, order_id } = await searchParams;

  if (!invoice_id) {
    if (order_id) {
      redirect(`/order/${order_id}?payment=invalid`);
    }
    redirect("/");
  }

  try {
    const paymentData = await verifyPayment(invoice_id);

    const targetOrderId =
      order_id || (paymentData.metadata?.order_id as string | undefined);

    if (targetOrderId) {
      // 1. Fetch order from DB
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, targetOrderId));

      if (order && paymentData.status === "COMPLETED") {
        // 2. Strict validation: Verify paid amount matches expected total amount
        const paidAmount = parseFloat(paymentData.amount || "0");
        const expectedAmount = Number(order.totalAmount);

        // Allow negligible difference for floating point or fee roundings (< 0.5 BDT)
        if (Math.abs(paidAmount - expectedAmount) < 0.5) {
          await db
            .update(orders)
            .set({
              paymentStatus: "paid",
              status: "confirmed",
              paymentTrxId: paymentData.transaction_id || null,
              paymentSenderNumber: paymentData.sender_number || null,
              paymentMethod: paymentData.payment_method || "online",
              paymentInvoiceId: invoice_id,
              updatedAt: new Date(),
            })
            .where(eq(orders.id, targetOrderId));

          if (order.couponCode) {
            const { coupons } = await import("@/lib/db/schema");
            const { sql } = await import("drizzle-orm");
            await db
              .update(coupons)
              .set({ usedCount: sql`${coupons.usedCount} + 1` })
              .where(eq(coupons.code, order.couponCode));
          }

          redirect(`/order/${targetOrderId}?payment=success`);
        } else {
          console.error(
            `Amount mismatch for order ${targetOrderId}: Expected ${expectedAmount}, received ${paidAmount}`,
          );
          redirect(`/order/${targetOrderId}?payment=amount_mismatch`);
        }
      } else {
        redirect(`/order/${targetOrderId}?payment=pending`);
      }
    }
  } catch (error) {
    console.error("Payment verification failed in callback:", error);
    if (order_id) {
      redirect(`/order/${order_id}?payment=error`);
    }
  }

  redirect("/");
}
