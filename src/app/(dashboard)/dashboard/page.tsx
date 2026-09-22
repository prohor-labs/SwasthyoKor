import { cookies } from "next/headers";
import Link from "next/link";
import { BagShopping, Box, CheckCircle, Receipt } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getCart } from "@/lib/db/queries";
import { orders } from "@/lib/db/schema";

export const metadata = {
  title: "ড্যাশবোর্ড | স্বাস্থ্যকর",
  description: "আপনার স্বাস্থ্যকর অ্যাকাউন্ট ড্যাশবোর্ড।",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;
  const cart = cartId ? await getCart(cartId) : null;
  const cartItemCount =
    cart?.lines.reduce((acc, line) => acc + line.quantity, 0) || 0;

  const allOrders = await db.select().from(orders);

  const stats = [
    {
      title: "মোট অর্ডার",
      value: allOrders.length.toLocaleString("bn-BD"),
      icon: Box,
      description: "আপনার সকল সক্রিয় ও সম্পন্ন অর্ডার",
    },
    {
      title: "কার্ট আইটেম",
      value: cartItemCount.toLocaleString("bn-BD"),
      icon: BagShopping,
      description: "বর্তমানে আপনার কার্টে থাকা পণ্য",
    },
    {
      title: "পেমেন্ট স্ট্যাটাস",
      value: "পরিশোধিত",
      icon: Receipt,
      description: "সকল লেনদেন নিরাপদ ও স্বচ্ছ",
    },
    {
      title: "অ্যাকাউন্ট স্ট্যাটাস",
      value: user?.isBanned ? "স্থগিত" : "সক্রিয়",
      icon: CheckCircle,
      description: user?.isAdmin ? "এডমিনিস্ট্রেটর অ্যাকাউন্ট" : "যাচাইকৃত গ্রাহক অ্যাকাউন্ট",
    },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-6xl">
      {/* ─── Greeting & Hero ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            স্বাগতম, স্বাস্থ্যকর ড্যাশবোর্ডে!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            আপনার অর্ডার, ডেলিভারি ট্র্যাকিং এবং প্রোফাইল এক জায়গা থেকেই পরিচালনা করুন।
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm text-white font-semibold shadow-xs transition-colors"
          >
            <BagShopping className="size-4" />
            শপিং করুন
          </Link>
        </div>
      </div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="rounded-2xl border-border bg-card shadow-xs"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Icon className="size-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ─── Recent Activity / Quick Actions ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-2xl border-border bg-card shadow-xs p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            সাম্প্রতিক অর্ডারসমূহ
          </h2>
          {allOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-border bg-muted/20">
              <Box className="size-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-semibold text-foreground">
                এখনো কোনো অর্ডার নেই
              </p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                খাঁটি মধু, ঘি বা অর্গানিক তেল সংগ্রহ করতে ব্রাউজ করুন।
              </p>
              <Link
                href="/search"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                পণ্য তালিকা দেখুন
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {allOrders.slice(0, 5).map((ord) => (
                <div
                  key={ord.id}
                  className="py-3 flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-muted text-foreground font-bold text-xs">
                      #{ord.id.slice(0, 6)}
                    </div>
                    <div>
                      <div className="font-bold text-foreground">
                        {ord.items.length}টি আইটেম
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(ord.createdAt).toLocaleDateString("bn-BD")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      ৳{ord.totalAmount.toLocaleString("bn-BD")}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                      {ord.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">
              প্রোফাইল তথ্য
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              আপনার ডেলিভারি ঠিকানা এবং যোগাযোগের তথ্য আপডেট রাখুন।
            </p>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border mb-4">
              <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
                {user?.name ? user.name[0].toUpperCase() : "স্ব"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-foreground truncate">
                  {user?.name || "গ্রাহক অ্যাকাউন্ট"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user?.email || "contact@swasthyokor.com"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors w-full"
            >
              মূল ওয়েবসাইটে ফিরুন
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl text-destructive hover:bg-destructive/10 px-4 py-2 text-xs font-semibold transition-colors w-full cursor-pointer"
              >
                লগআউট করুন
              </button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
