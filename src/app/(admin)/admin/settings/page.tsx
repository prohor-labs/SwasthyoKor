import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { StoreSettingsForm } from "@/components/admin/StoreSettingsForm";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { storeSettings } from "@/lib/db/schema";

export const metadata = {
  title: "স্টোর সেটিংস | অ্যাডমিন",
  description: "স্টোর ডেলিভারি চার্জ এবং কনফিগারেশন পরিচালনা।",
};

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    redirect("/login");
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

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          স্টোর সেটিংস
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          ডেলিভারি চার্জ, ফ্রি শিপিং ও যোগাযোগের তথ্য নির্ধারণ করুন।
        </p>
      </div>

      <StoreSettingsForm initialSettings={settings} />
    </div>
  );
}
