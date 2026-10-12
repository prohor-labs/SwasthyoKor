import { redirect } from "next/navigation";

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

  const serverUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
    "http://localhost:3001";

  if (invoice_id && order_id) {
    redirect(
      `${serverUrl}/api/payment/callback?order_id=${order_id}&invoice_id=${invoice_id}`,
    );
  }

  if (order_id) {
    redirect(`/order/${order_id}`);
  }

  redirect("/");
}
