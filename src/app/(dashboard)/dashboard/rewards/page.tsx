import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { LoyaltyPointsCard } from "@/components/dashboard";
import { Gift, Sparkles, TrendUp } from "@/components/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LOYALTY_CONFIG } from "@/config/loyalty";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";

export const metadata = {
  title: "রিওয়ার্ড ও ক্যাশব্যাক পয়েন্ট | স্বাস্থ্যকর",
  description: "আপনার স্বাস্থ্যকর রিওয়ার্ড পয়েন্ট, কয়েন ওয়ালেট ও সঞ্চিত ক্যাশব্যাক বোনাস।",
};

export default async function RewardsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/dashboard/rewards");
  }

  // Fetch user's completed orders to calculate earned purchase points
  const userOrders = await db.query.orders.findMany({
    where: user.email ? eq(orders.email, user.email) : undefined,
  });

  // Calculate points from purchases (1 point per 100 BDT)
  const totalSpent = userOrders.reduce(
    (sum, ord) => sum + (ord.totalAmount || 0),
    0,
  );
  const purchasePointsEarned = Math.floor(
    totalSpent / LOYALTY_CONFIG.spendAmountPerPoint,
  );

  const initialPoints = LOYALTY_CONFIG.signupRewardPoints;
  const currentTotalPoints = initialPoints + purchasePointsEarned;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Main Loyalty Points Wallet Card with auto-confetti */}
      <LoyaltyPointsCard
        balance={initialPoints}
        earnedPoints={purchasePointsEarned}
      />

      {/* Points History & Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">সাইনআপ বোনাস</CardDescription>
            <CardTitle className="text-xl font-bold text-foreground">
              +{initialPoints} পয়েন্ট
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Gift className="size-3.5 text-amber-500" />
              অ্যাকাউন্ট খোলার উপহার
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">
              অর্ডার থেকে অর্জিত
            </CardDescription>
            <CardTitle className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              +{purchasePointsEarned} পয়েন্ট
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <TrendUp className="size-3.5 text-emerald-500" />
              {userOrders.length}টি অর্ডারে ৳
              {Math.round(totalSpent).toLocaleString("bn-BD")} কেনাকাটা
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">
              মোট রিওয়ার্ড মূল্য
            </CardDescription>
            <CardTitle className="text-xl font-bold text-foreground">
              ৳
              {(
                currentTotalPoints * LOYALTY_CONFIG.pointToBdtRate
              ).toLocaleString("bn-BD")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-amber-500" />
              পরবর্তী অর্ডারে ব্যবহারযোগ্য
            </p>
          </CardContent>
        </Card>
      </div>

      {/* How It Works Guide */}
      <Card className="rounded-2xl border-border bg-card shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold text-foreground">
            রিওয়ার্ড পয়েন্ট কীভাবে কাজ করে?
          </CardTitle>
          <CardDescription className="text-xs">
            সহজ ৩টি ধাপে ক্যাশব্যাক সুবিধা নিন
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-border/60 bg-muted/30">
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                ১
              </span>
              <h4 className="font-semibold text-sm text-foreground">
                অ্যাকাউন্ট খুলুন
              </h4>
              <p className="text-xs text-muted-foreground">
                সাইনআপ করলেই তাৎক্ষণিক ফ্রি ৫০ পয়েন্ট ওয়েলকাম বোনাস আপনার ওয়ালেটে জমা হয়।
              </p>
            </div>

            <div className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-border/60 bg-muted/30">
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                ২
              </span>
              <h4 className="font-semibold text-sm text-foreground">
                পণ্য কিনুন
              </h4>
              <p className="text-xs text-muted-foreground">
                প্রতি ১০০ টাকার কেনাকাটায় ১ পয়েন্ট অর্জন করুন। যত বেশি কেনাকাটা, তত বেশি
                রিওয়ার্ড!
              </p>
            </div>

            <div className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-border/60 bg-muted/30">
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                ৩
              </span>
              <h4 className="font-semibold text-sm text-foreground">ছাড় নিন</h4>
              <p className="text-xs text-muted-foreground">
                অর্ডারের সময় ১ পয়েন্ট = ১ টাকা সমমূল্যে পয়েন্ট রিডিম করে বিল থেকে সরাসরি
                ছাড় উপভোগ করুন।
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
