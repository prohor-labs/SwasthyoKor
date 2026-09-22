import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BagShopping, CheckCircle } from "@/components/icons";
import LogoSquare from "@/components/logo-square";
import Price from "@/components/price";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getOrder } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "অর্ডার বিস্তারিত | স্বাস্থ্যকর",
  description: "আপনার অর্ডারের বিবরণ ও পেমেন্ট স্ট্যাটাস।",
};

interface OrderPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}

export default async function OrderSuccessPage({
  params,
  searchParams,
}: OrderPageProps) {
  const { id } = await params;
  const { payment } = await searchParams;
  const order = await getOrder(id);

  if (!order) return notFound();

  const orderNumber = order.id.slice(0, 8).toUpperCase();
  const isPaid = order.paymentStatus === "paid" || payment === "success";

  return (
    <div className="min-h-screen bg-neutral-50/60 dark:bg-neutral-950 py-5 px-3 sm:py-8 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-xl mx-auto w-full">
        {/* Minimal Header */}
        <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-border/80 mb-5 sm:mb-8">
          <Link
            href="/"
            className="flex items-center text-emerald-800 dark:text-emerald-300"
            aria-label="স্বাস্থ্যকর"
          >
            <LogoSquare size="sm" />
          </Link>
        </div>

        <Card className="border-border/80 bg-card rounded-xl sm:rounded-2xl shadow-xs overflow-hidden py-0 gap-0">
          <CardHeader className="text-center p-4 sm:p-6 pb-2 sm:pb-3">
            <div
              className={`mx-auto mb-3 flex size-14 sm:size-16 items-center justify-center rounded-xl sm:rounded-2xl ${
                isPaid
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}
            >
              <CheckCircle className="size-8 sm:size-9" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {isPaid
                ? "পেমেন্ট সফল! অর্ডার নিশ্চিত হয়েছে"
                : "পেমেন্ট অসম্পূর্ণ বা অপেক্ষমাণ"}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground pt-1">
              অর্ডার ট্র্যাকিং নম্বর:{" "}
              <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded-md">
                #{orderNumber}
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent className="p-3.5 sm:p-6 pt-2 sm:pt-4 space-y-4 sm:space-y-6">
            {/* Status Alert */}
            {isPaid ? (
              <div className="rounded-lg sm:rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 sm:p-3.5 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                <p className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                  ✓ অনলাইনে সম্পূর্ণ মূল্য পরিশোধিত হয়েছে
                </p>
                <p>
                  আপনার পেমেন্ট ভেরিফাই হয়েছে। আমাদের ডেলিভারি টিম দ্রুততম সময়ে আপনার
                  পণ্য পাঠিয়ে দেবে।
                </p>
                {order.paymentTrxId ? (
                  <p className="font-mono text-[11px] pt-0.5">
                    TrxID:{" "}
                    <span className="font-bold">{order.paymentTrxId}</span>
                  </p>
                ) : null}
              </div>
            ) : payment === "cancelled" || payment === "failed" ? (
              <div className="rounded-lg sm:rounded-xl border border-red-500/40 bg-red-500/10 p-3 sm:p-3.5 text-xs text-red-800 dark:text-red-300 space-y-1">
                <p className="font-bold text-sm mb-0.5">
                  অনলাইন পেমেন্ট সম্পন্ন হয়নি
                </p>
                <p>
                  স্বাস্থ্যকরে শুধুমাত্র অগ্রিম অনলাইন পেমেন্টের মাধ্যমে অর্ডার গ্রহণ করা হয়।
                  অনুগ্রহ করে পুনরায় অর্ডার করুন অথবা পেমেন্ট সম্পন্ন করুন।
                </p>
              </div>
            ) : (
              <div className="rounded-lg sm:rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 sm:p-3.5 text-xs text-amber-800 dark:text-amber-300">
                <p className="font-semibold text-sm mb-0.5">পেমেন্ট যাচাই চলছে:</p>
                <p>আপনার পেমেন্ট কনফার্মেশন পাওয়ার সাথে সাথেই অর্ডার প্রসেস শুরু হবে।</p>
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5 sm:mb-3">
                অর্ডারকৃত পণ্যের তালিকা
              </h3>
              <ul className="divide-y divide-border/60 rounded-lg sm:rounded-xl border border-border/60 bg-muted/20 px-3 sm:px-4">
                {order.items.map((item, i) => (
                  <li
                    key={`${item.productHandle}-${item.variantTitle}-${i}`}
                    className="flex items-center justify-between py-2.5 sm:py-3.5 text-sm"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <Link
                        href={`/product/${item.productHandle}`}
                        className="font-semibold text-foreground hover:text-emerald-600 transition-colors line-clamp-1"
                      >
                        {item.productTitle}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.variantTitle !== "Default Title"
                          ? `${item.variantTitle} · `
                          : ""}
                        পরিমাণ: {item.quantity}টি
                      </p>
                    </div>
                    <Price
                      className="font-bold text-foreground text-sm shrink-0"
                      amount={(item.priceAmount * item.quantity).toFixed(2)}
                      currencyCode={item.priceCurrency}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>ডেলিভারি চার্জ</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ফ্রি
                </span>
              </div>
              {order.couponCode &&
              order.discountAmount &&
              order.discountAmount > 0 ? (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>কুপন ছাড় ({order.couponCode})</span>
                  <span>-৳{order.discountAmount.toFixed(0)}</span>
                </div>
              ) : null}

              <div className="flex items-center justify-between text-muted-foreground">
                <span>পেমেন্ট পদ্ধতি</span>
                <span className="font-medium text-foreground">
                  অনলাইন গেটওয়ে (
                  {order.paymentMethod
                    ? order.paymentMethod.toUpperCase()
                    : "UDDOKTAPAY"}
                  )
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>পেমেন্ট স্ট্যাটাস</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded-md ${
                    isPaid
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {isPaid ? "পরিশোধিত (Paid)" : "অপরিশোধিত (Unpaid / Pending)"}
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between pt-1">
              <span className="text-sm sm:text-base font-bold text-foreground">
                সর্বমোট প্রদেয় মূল্য
              </span>
              <Price
                className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400"
                amount={order.totalAmount.toFixed(2)}
                currencyCode={order.totalCurrency}
              />
            </div>
          </CardContent>

          <CardFooter className="p-3.5 sm:p-6 pt-2 pb-4 sm:pb-6">
            <Button
              render={
                <Link href="/">
                  <BagShopping className="size-4" />
                  <span>আরও কেনাকাটা করুন</span>
                </Link>
              }
              size="lg"
              className="w-full rounded-lg sm:rounded-xl bg-emerald-600 font-semibold text-white hover:bg-emerald-700 h-11 text-sm sm:text-base shadow-xs cursor-pointer"
            />
          </CardFooter>
        </Card>
      </div>

      <div className="text-center py-6 text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()} স্বাস্থ্যকর — খাঁটি ও প্রাকৃতিক পণ্যের নির্ভরযোগ্য
          প্রতিষ্ঠান
        </p>
      </div>
    </div>
  );
}
