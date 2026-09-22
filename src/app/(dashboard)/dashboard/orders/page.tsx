import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Box, Calendar, Package, Receipt } from "@/components/icons";
import { ListCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "আমার অর্ডারসমূহ | স্বাস্থ্যকর",
  description: "আপনার অতীত ও সাম্প্রতিক অর্ডারসমূহের তালিকা ও ট্র্যাকিং।",
};

const STATUS_MAP: Record<
  string,
  {
    label: string;
    badge: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  confirmed: {
    label: "কনফার্মড",
    badge: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
    variant: "outline",
  },
  shipped: {
    label: "ডেলিভারিতে",
    badge:
      "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    variant: "outline",
  },
  delivered: {
    label: "ডেলিভার্ড",
    badge:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    variant: "outline",
  },
  cancelled: {
    label: "বাতিল",
    badge: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
    variant: "destructive",
  },
};

export default async function UserOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/orders");

  const userOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.email, user.email))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            আমার অর্ডারসমূহ
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            মোট {userOrders.length}টি অর্ডার পাওয়া গিয়েছে।
          </p>
        </div>
        <Button
          render={
            <Link href="/search">
              <Box data-icon="inline-start" />
              <span>নতুন অর্ডার করুন</span>
            </Link>
          }
          className="rounded-xl shadow-xs"
        />
      </div>

      {/* Order list */}
      {userOrders.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>এখনো কোনো অর্ডার নেই</EmptyTitle>
            <EmptyDescription>
              আপনার পছন্দের স্বাস্থ্যকর পণ্য অর্ডার করতে শপ ব্রাউজ করুন।
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {userOrders.map((ord) => {
            const itemCount = ord.items.reduce((s, i) => s + i.quantity, 0);
            const firstTitle = ord.items[0]?.productTitle ?? "পণ্য";
            const moreCount = ord.items.length - 1;
            const status = STATUS_MAP[ord.status] ?? {
              label: ord.status,
              badge: "",
              variant: "outline" as const,
            };

            return (
              <ListCard
                key={ord.id}
                icon={
                  <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Receipt className="size-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                }
                title={`অর্ডার #${ord.id.slice(0, 8).toUpperCase()}`}
                badges={[
                  {
                    label: status.label,
                    variant: status.variant,
                    className: cn("border font-semibold", status.badge),
                  },
                ]}
                subtitle={
                  moreCount > 0
                    ? `${firstTitle} সহ আরও ${moreCount}টি পণ্য`
                    : firstTitle
                }
                metaItems={[
                  {
                    icon: <Calendar className="size-3.5" />,
                    label: "তারিখ:",
                    value: new Date(ord.createdAt).toLocaleDateString("bn-BD", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }),
                  },
                  {
                    icon: <Package className="size-3.5" />,
                    label: "আইটেম:",
                    value: `${itemCount}টি`,
                  },
                  {
                    label: "মোট:",
                    value: `৳${ord.totalAmount.toFixed(2)}`,
                  },
                ]}
                actions={[
                  {
                    label: "বিস্তারিত দেখুন",
                    href: `/order/${ord.id}`,
                    variant: "default",
                  },
                ]}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
