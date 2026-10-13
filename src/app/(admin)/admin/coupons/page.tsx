import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { CouponsManager } from "@/components/admin/CouponsManager";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";

export const metadata = {
  title: "কুপন ও প্রোমোকোড | অ্যাডমিন",
  description: "ডিসকাউন্ট কুপন তৈরি ও পরিচালনা।",
};

export default async function AdminCouponsPage() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    redirect("/login");
  }

  const allCoupons = await db
    .select()
    .from(coupons)
    .orderBy(desc(coupons.createdAt));

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          কুপন ও ডিসকাউন্ট ভাউচার
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          কাস্টমারদের জন্য প্রোমোকোড ও বিশেষ ক্যাম্পেইন ছাড় তৈরি করুন।
        </p>
      </div>

      <CouponsManager initialCoupons={allCoupons} />
    </div>
  );
}
