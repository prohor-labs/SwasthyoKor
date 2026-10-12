import { AdminBannersManager } from "@/components/admin/AdminBannersManager";
import { db } from "@/lib/db";
import { heroBanners } from "@/lib/db/schema";

export const metadata = {
  title: "হিরো ব্যানার স্লাইডার | অ্যাডমিন",
  description: "হোমপেজের হিরো ব্যানার স্লাইডার কনটেন্ট ও ছবি পরিচালনা।",
};

export default async function AdminBannersPage() {
  const allBanners = await db
    .select()
    .from(heroBanners)
    .orderBy(heroBanners.position);

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          হিরো ব্যানার স্লাইডার পরিচালনা
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          হোমপেজের টপ ব্যানার স্লাইডারের টেক্সট, হাইলাইট কালার, লিঙ্ক এবং ইমেজ লাইভ পরিবর্তন
          করুন।
        </p>
      </div>

      <AdminBannersManager banners={allBanners} />
    </div>
  );
}
